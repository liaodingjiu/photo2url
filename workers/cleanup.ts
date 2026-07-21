/**
 * Cleanup Worker — Cron Trigger
 *
 * Runs daily at 3:00 AM UTC.
 * Finds expired files in D1 and deletes them from both R2 and D1.
 *
 * Deploy as a separate Cloudflare Worker, or use wrangler.toml [triggers]
 * to run this as a scheduled function.
 */

interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  TURNSTILE_SECRET_KEY: string;
  LEMON_SQUEEZY_WEBHOOK_SECRET: string;
  LEMON_SQUEEZY_PLUS_VARIANT_ID: string;
  LEMON_SQUEEZY_ENTERPRISE_VARIANT_ID: string;
  R2_BUCKET_NAME: string;
  CDN_DOMAIN: string;
  APP_URL: string;
}

interface ExpiredFile {
  id: string;
  r2_key: string;
  user_id: string | null;
  file_size: number;
}

export default {
  async scheduled(
    _event: ScheduledEvent,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    console.log("[cleanup] Starting expired file cleanup...");

    try {
      // 1. Find expired files
      const { results } = await env.DB.prepare(
        `SELECT id, r2_key, user_id, file_size
         FROM files
         WHERE expires_at < datetime('now')
         LIMIT 500`
      ).all<ExpiredFile>();

      if (!results || results.length === 0) {
        console.log("[cleanup] No expired files found.");
        return;
      }

      console.log(`[cleanup] Found ${results.length} expired files.`);

      // 2. Delete from R2 and D1
      let deletedCount = 0;
      let failedCount = 0;

      for (const file of results) {
        try {
          // Delete from R2
          await env.BUCKET.delete(file.r2_key);

          // Delete D1 record
          await env.DB.prepare("DELETE FROM files WHERE id = ?")
            .bind(file.id)
            .run();

          // Update user storage (if user exists)
          if (file.user_id) {
            await env.DB.prepare(
              "UPDATE users SET storage_used = MAX(0, storage_used - ?) WHERE id = ?"
            )
              .bind(file.file_size, file.user_id)
              .run();
          }

          deletedCount++;
        } catch (error) {
          console.error(
            `[cleanup] Failed to delete file ${file.id}:`,
            error
          );
          failedCount++;
        }
      }

      console.log(
        `[cleanup] Complete: ${deletedCount} deleted, ${failedCount} failed.`
      );
    } catch (error) {
      console.error("[cleanup] Fatal error:", error);
      throw error;
    }
  },
};

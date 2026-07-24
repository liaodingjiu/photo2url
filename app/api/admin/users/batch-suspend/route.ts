/**
 * POST /api/admin/users/batch-suspend — Suspend multiple users at once (max 10)
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";

export const runtime = "edge";

const MAX_BATCH = 10;

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (admin.error) return admin.error;

  try {
    const db = (process.env as any).DB;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const { userIds, reason } = await request.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "userIds must be a non-empty array" }, { status: 400 });
    }
    if (userIds.length > MAX_BATCH) {
      return NextResponse.json(
        { error: `Max ${MAX_BATCH} users per batch` },
        { status: 400 }
      );
    }
    if (userIds.includes(admin.userId)) {
      return NextResponse.json({ error: "Cannot suspend yourself" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    const results: string[] = [];

    for (const targetId of userIds) {
      try {
        const user = await db
          .prepare("SELECT id, suspended_at FROM users WHERE id = ?")
          .bind(targetId)
          .first();
        if (!user || (user as any).suspended_at) continue;

        await db
          .prepare("UPDATE users SET suspended_at = ? WHERE id = ?")
          .bind(now, targetId)
          .run();

        await db
          .prepare(
            "INSERT INTO admin_logs (admin_id, target_user_id, action, detail, ip_address) VALUES (?, ?, 'suspend', ?, ?)"
          )
          .bind(
            admin.userId,
            targetId,
            JSON.stringify({ reason, suspended_at: now, batch: true }),
            ip
          )
          .run();

        results.push(targetId);
      } catch {
        // Skip individual failures, continue with the batch
      }
    }

    return NextResponse.json({ success: true, suspended: results.length, userIds: results });
  } catch (error) {
    console.error("[admin-batch-suspend] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

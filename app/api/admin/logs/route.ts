/**
 * GET /api/admin/logs — List admin operation logs
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { checkRateLimit } from "@/lib/rate-limiter";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin();
  if (admin.error) return admin.error;
  if (!checkRateLimit(admin.userId)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const db = (process.env as any).DB;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const offset = (page - 1) * limit;

    // Cleanup old logs (>90 days) on every read
    try {
      await db
        .prepare("DELETE FROM admin_logs WHERE created_at < datetime('now', '-90 days')")
        .run();
    } catch { /* best-effort cleanup */ }

    const countResult = await db
      .prepare("SELECT COUNT(*) as total FROM admin_logs")
      .first();
    const total = (countResult as any)?.total || 0;

    const logs = await db
      .prepare(
        `SELECT admin_id, target_user_id, action, detail, ip_address, created_at
         FROM admin_logs
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(limit, offset)
      .all();

    return NextResponse.json({
      logs: (logs as any).results || [],
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[admin-logs] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

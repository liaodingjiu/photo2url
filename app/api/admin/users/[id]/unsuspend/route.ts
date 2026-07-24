/**
 * POST /api/admin/users/[id]/unsuspend — Unsuspend a user
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";

export const runtime = "edge";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (admin.error) return admin.error;

  try {
    const db = (process.env as any).DB;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const { id } = await params;

    const user = await db.prepare("SELECT id, suspended_at FROM users WHERE id = ?").bind(id).first();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (!(user as any).suspended_at) {
      return NextResponse.json({ error: "User is not suspended" }, { status: 400 });
    }

    await db.prepare("UPDATE users SET suspended_at = NULL WHERE id = ?").bind(id).run();

    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    await db
      .prepare(
        "INSERT INTO admin_logs (admin_id, target_user_id, action, detail, ip_address) VALUES (?, ?, 'unsuspend', ?, ?)"
      )
      .bind(admin.userId, id, null, ip)
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin-unsuspend] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

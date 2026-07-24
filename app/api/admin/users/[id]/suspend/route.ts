/**
 * POST /api/admin/users/[id]/suspend — Suspend a user
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
    const { reason } = await request.json();

    if (!reason || reason.length < 5) {
      return NextResponse.json({ error: "Reason must be at least 5 characters" }, { status: 400 });
    }

    // Prevent self-suspension
    if (id === admin.userId) {
      return NextResponse.json({ error: "Cannot suspend yourself" }, { status: 400 });
    }

    const user = await db.prepare("SELECT id, suspended_at FROM users WHERE id = ?").bind(id).first();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if ((user as any).suspended_at) {
      return NextResponse.json({ error: "User is already suspended" }, { status: 400 });
    }

    const now = new Date().toISOString();
    await db.prepare("UPDATE users SET suspended_at = ? WHERE id = ?").bind(now, id).run();

    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    await db
      .prepare(
        "INSERT INTO admin_logs (admin_id, target_user_id, action, detail, ip_address) VALUES (?, ?, 'suspend', ?, ?)"
      )
      .bind(admin.userId, id, JSON.stringify({ reason, suspended_at: now }), ip)
      .run();

    return NextResponse.json({ success: true, suspended_at: now });
  } catch (error) {
    console.error("[admin-suspend] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

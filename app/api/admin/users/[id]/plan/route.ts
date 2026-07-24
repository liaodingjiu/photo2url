/**
 * POST /api/admin/users/[id]/plan — Change user plan type
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";

export const runtime = "edge";

const VALID_PLANS = ["free", "plus", "enterprise"];

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
    const { plan_type } = await request.json();

    if (!plan_type || !VALID_PLANS.includes(plan_type)) {
      return NextResponse.json({ error: "Invalid plan_type" }, { status: 400 });
    }

    const user = await db.prepare("SELECT id, plan_type FROM users WHERE id = ?").bind(id).first();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const before = (user as any).plan_type;
    await db.prepare("UPDATE users SET plan_type = ? WHERE id = ?").bind(plan_type, id).run();

    // Log
    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    await db
      .prepare(
        "INSERT INTO admin_logs (admin_id, target_user_id, action, detail, ip_address) VALUES (?, ?, 'plan_change', ?, ?)"
      )
      .bind(admin.userId, id, JSON.stringify({ before, after: plan_type }), ip)
      .run();

    return NextResponse.json({ success: true, plan_type });
  } catch (error) {
    console.error("[admin-plan] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

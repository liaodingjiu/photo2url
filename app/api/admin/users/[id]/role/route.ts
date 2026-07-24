/**
 * POST /api/admin/users/[id]/role — Promote/demote admin role
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { clerkClient } from "@clerk/nextjs/server";

export const runtime = "edge";

const VALID_ROLES = ["admin", "user"];

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
    const { role } = await request.json();

    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Prevent demoting the last admin
    if (role === "user") {
      const clerk = await clerkClient();
      // Count admins from Clerk
      const allUsers = await clerk.users.getUserList({ limit: 500 });
      const adminCount = allUsers.data.filter(
        (u) => (u.publicMetadata as any)?.role === "admin"
      ).length;
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last admin" },
          { status: 400 }
        );
      }
    }

    const clerk = await clerkClient();
    const targetUser = await clerk.users.getUser(id);
    const currentMetadata = (targetUser.publicMetadata || {}) as Record<string, unknown>;

    await clerk.users.updateUser(id, {
      publicMetadata: { ...currentMetadata, role },
    });

    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    await db
      .prepare(
        "INSERT INTO admin_logs (admin_id, target_user_id, action, detail, ip_address) VALUES (?, ?, 'role_change', ?, ?)"
      )
      .bind(admin.userId, id, JSON.stringify({ role }), ip)
      .run();

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error("[admin-role] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

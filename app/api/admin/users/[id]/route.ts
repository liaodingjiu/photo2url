/**
 * GET /api/admin/users/[id] — Single user detail
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { clerkClient } from "@clerk/nextjs/server";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (admin.error) return admin.error;

  try {
    const db = (process.env as any).DB;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const { id } = await params;

    const user = await db
      .prepare(
        `SELECT id, email, plan_type, storage_used, suspended_at, created_at
         FROM users WHERE id = ?`
      )
      .bind(id)
      .first();

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // File count & recent files
    const files = await db
      .prepare(
        `SELECT id, original_name, file_size, mime_type, created_at
         FROM files WHERE user_id = ?
         ORDER BY created_at DESC LIMIT 20`
      )
      .bind(id)
      .all();

    // Recent admin logs for this user
    const logs = await db
      .prepare(
        `SELECT admin_id, action, detail, ip_address, created_at
         FROM admin_logs WHERE target_user_id = ?
         ORDER BY created_at DESC LIMIT 10`
      )
      .bind(id)
      .all();

    const u = user as any;
    let email = u.email;

    // Fix placeholder email by fetching real email from Clerk
    if (email && email.includes("@placeholder")) {
      try {
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(id);
        const realEmail = clerkUser.emailAddresses?.[0]?.emailAddress;
        if (realEmail) {
          email = realEmail;
          await db
            .prepare("UPDATE users SET email = ? WHERE id = ?")
            .bind(realEmail, id)
            .run();
        }
      } catch { /* Keep placeholder if Clerk lookup fails */ }
    }

    return NextResponse.json({
      user: {
        id: u.id,
        email,
        planType: u.plan_type,
        storageUsed: u.storage_used,
        suspendedAt: u.suspended_at || null,
        createdAt: u.created_at,
      },
      fileCount: (files as any).results?.length || 0,
      files: (files as any).results || [],
      logs: (logs as any).results || [],
    });
  } catch (error) {
    console.error("[admin-user-detail] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

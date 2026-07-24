/**
 * POST /api/admin/sync-users — Sync Clerk users to D1
 * Creates D1 records for Clerk users who don't have one yet.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { clerkClient } from "@clerk/nextjs/server";

export const runtime = "edge";

export async function POST(_request: NextRequest) {
  const admin = await verifyAdmin();
  if (admin.error) return admin.error;

  try {
    const db = (process.env as any).DB;
    if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

    const clerk = await clerkClient();
    let created = 0;
    let skipped = 0;

    // Fetch Clerk users in pages (max ~500 for typical projects)
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const { data: clerkUsers, totalCount } = await clerk.users.getUserList({
        limit,
        offset,
      });

      for (const cu of clerkUsers) {
        const email = cu.emailAddresses?.[0]?.emailAddress;
        if (!email) continue;

        // Check if D1 record exists
        const existing = await db
          .prepare("SELECT id FROM users WHERE id = ?")
          .bind(cu.id)
          .first();

        if (existing) {
          skipped++;
          // Still update email if it was a placeholder
          const currentEmail = (existing as any)?.email;
          if (!currentEmail || currentEmail.includes("@placeholder")) {
            await db
              .prepare("UPDATE users SET email = ? WHERE id = ?")
              .bind(email, cu.id)
              .run();
          }
        } else {
          await db
            .prepare(
              "INSERT INTO users (id, email, plan_type) VALUES (?, ?, 'free')"
            )
            .bind(cu.id, email)
            .run();
          created++;
        }
      }

      offset += limit;
      hasMore = offset < totalCount;
    }

    return NextResponse.json({
      success: true,
      created,
      skipped,
      total: created + skipped,
    });
  } catch (error) {
    console.error("[admin-sync-users] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

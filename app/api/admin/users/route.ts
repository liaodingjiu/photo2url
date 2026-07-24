/**
 * GET /api/admin/users — List users with search, filter, pagination
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { checkRateLimit } from "@/lib/rate-limiter";
import { clerkClient } from "@clerk/nextjs/server";

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
    const search = searchParams.get("search") || "";
    const plan = searchParams.get("plan") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;

    let where = "WHERE 1=1";
    const params: any[] = [];

    if (search) {
      where += " AND (email LIKE ? OR id LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (plan) {
      where += " AND plan_type = ?";
      params.push(plan);
    }
    if (status === "suspended") {
      where += " AND suspended_at IS NOT NULL";
    } else if (status === "active") {
      where += " AND suspended_at IS NULL";
    }

    // Count total
    const countResult = await db
      .prepare(`SELECT COUNT(*) as total FROM users ${where}`)
      .bind(...params)
      .first();
    const total = (countResult as any)?.total || 0;

    // Fetch page
    const users = await db
      .prepare(
        `SELECT id, email, plan_type, storage_used, suspended_at, created_at
         FROM users ${where}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(...params, limit, offset)
      .all();

    // Get file count for each user in this page
    const userIds = (users.results as any[]).map((u) => u.id);
    const fileCountMap: Record<string, number> = {};
    if (userIds.length > 0) {
      const placeholders = userIds.map(() => "?").join(",");
      const fileCounts = await db
        .prepare(
          `SELECT user_id, COUNT(*) as count FROM files WHERE user_id IN (${placeholders}) GROUP BY user_id`
        )
        .bind(...userIds)
        .all();
      for (const row of (fileCounts as any).results || []) {
        fileCountMap[row.user_id] = row.count;
      }
    }

    const result = await Promise.all(
      (users.results as any[]).map(async (u) => {
        let email = u.email;
        // Fix placeholder emails by fetching real email from Clerk
        if (email && email.includes("@placeholder")) {
          try {
            const clerk = await clerkClient();
            const clerkUser = await clerk.users.getUser(u.id);
            const realEmail = clerkUser.emailAddresses?.[0]?.emailAddress;
            if (realEmail) {
              email = realEmail;
              // Backfill D1 record
              await db
                .prepare("UPDATE users SET email = ? WHERE id = ?")
                .bind(realEmail, u.id)
                .run();
            }
          } catch { /* Keep placeholder if Clerk lookup fails */ }
        }
        return {
          id: u.id,
          email,
          planType: u.plan_type,
          storageUsed: u.storage_used,
          fileCount: fileCountMap[u.id] || 0,
          suspendedAt: u.suspended_at || null,
          createdAt: u.created_at,
        };
      })
    );

    return NextResponse.json({
      users: result,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[admin-users] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

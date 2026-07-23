import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "edge";

/**
 * GET /api/files
 * List files for the current user (authenticated via Clerk) or guest (via cookie).
 */
export async function GET(request: NextRequest) {
  try {
    // Use auth() directly instead of request.auth?.userId — the latter is
    // middleware-injected and unreliable under @cloudflare/next-on-pages.
    let clerkUserId: string | null = null;
    try {
      const { userId } = await auth();
      clerkUserId = userId ?? null;
    } catch {
      // Clerk not configured — fall through to guest mode
    }

    const cookieId = request.cookies.get("p2u_guest_id")?.value;

    if (!clerkUserId && !cookieId) {
      return NextResponse.json({ files: [] });
    }

    const db = (process.env as any).DB;
    if (!db) {
      return NextResponse.json({ files: [] });
    }

    let results;

    if (clerkUserId) {
      // Logged-in user: get all their files
      results = await db
        .prepare(
          `SELECT id, original_name, file_size, mime_type, created_at, expires_at, r2_key
           FROM files
           WHERE user_id = ?
           ORDER BY created_at DESC
           LIMIT 100`
        )
        .bind(clerkUserId)
        .all();
    } else {
      // Guest user: get files by cookie_id
      results = await db
        .prepare(
          `SELECT id, original_name, file_size, mime_type, created_at, expires_at, r2_key
           FROM files
           WHERE cookie_id = ? AND user_id IS NULL
           ORDER BY created_at DESC
           LIMIT 100`
        )
        .bind(cookieId)
        .all();
    }

    return NextResponse.json({ files: results?.results || [] });
  } catch (error) {
    console.error("[list-files] Error:", error);
    return NextResponse.json({ files: [] });
  }
}

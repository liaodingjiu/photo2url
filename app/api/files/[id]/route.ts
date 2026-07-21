import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

/**
 * DELETE /api/files/[id]
 * Delete a file from R2 and D1. Verifies ownership.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fileId } = await params;

    // Get user identity (Clerk via middleware, or guest via cookie)
    const clerkUserId = (request as any).auth?.userId;
    const cookieId = request.cookies.get("p2u_guest_id")?.value;

    if (!clerkUserId && !cookieId) {
      return NextResponse.json(
        { success: false, error: "unauthorized" },
        { status: 401 }
      );
    }

    const db = (process.env as any).DB;
    const bucket = (process.env as any).BUCKET;

    // Find the file record
    const file = await db
      .prepare("SELECT * FROM files WHERE id = ?")
      .bind(fileId)
      .first();

    if (!file) {
      return NextResponse.json(
        { success: false, error: "not_found", message: "File not found" },
        { status: 404 }
      );
    }

    // Ownership check: user must match user_id (logged in) or cookie_id (guest)
    const isOwner =
      (clerkUserId && file.user_id === clerkUserId) ||
      (cookieId && file.cookie_id === cookieId);

    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: "forbidden" },
        { status: 403 }
      );
    }

    // Delete from R2
    if (bucket) {
      await bucket.delete(file.r2_key);
    }

    // Delete D1 record
    await db.prepare("DELETE FROM files WHERE id = ?").bind(fileId).run();

    // Update storage used (if user is logged in)
    if (file.user_id) {
      await db
        .prepare(
          "UPDATE users SET storage_used = MAX(0, storage_used - ?) WHERE id = ?"
        )
        .bind(file.file_size, file.user_id)
        .run();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[delete] Error:", error);
    return NextResponse.json(
      { success: false, error: "server_error" },
      { status: 500 }
    );
  }
}

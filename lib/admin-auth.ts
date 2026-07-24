/**
 * Admin authorization helper.
 * Verifies the current user has admin role via Clerk publicMetadata.
 */

import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export interface AdminAuthResult {
  userId: string;
  error?: NextResponse;
}

/**
 * Verify the current request is from an admin user.
 * Returns the admin userId on success, or a 403 error response.
 *
 * Usage in API routes:
 *   const admin = await verifyAdmin();
 *   if (admin.error) return admin.error;
 *   // admin.userId is the admin's Clerk user ID
 */
export async function verifyAdmin(): Promise<AdminAuthResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        userId: "",
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const metadata = user.publicMetadata as Record<string, unknown>;

    if (metadata.role !== "admin") {
      return {
        userId: "",
        error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      };
    }

    return { userId };
  } catch {
    return {
      userId: "",
      error: NextResponse.json({ error: "Authentication failed" }, { status: 500 }),
    };
  }
}

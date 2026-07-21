import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export const runtime = "edge";

async function getDashboardData(userId: string) {
  try {
    const db = (process.env as any).DB;
    if (!db) return null;

    // User plan + storage
    const user = await db
      .prepare("SELECT plan_type, storage_used FROM users WHERE id = ?")
      .bind(userId)
      .first();

    // Today's upload count (count files created today by this user)
    const today = new Date().toISOString().split("T")[0];
    const uploadCount = await db
      .prepare(
        `SELECT COUNT(*) as today_count
         FROM files
         WHERE user_id = ? AND date(created_at) = ?`
      )
      .bind(userId, today)
      .first();

    // File count
    const fileCount = await db
      .prepare(
        "SELECT COUNT(*) as count, COALESCE(SUM(file_size), 0) as total_size FROM files WHERE user_id = ?"
      )
      .bind(userId)
      .first();

    return {
      planType: (user as any)?.plan_type || "free",
      storageUsed: (user as any)?.storage_used || 0,
      uploadsToday: (uploadCount as any)?.today_count || 0,
      fileCount: (fileCount as any)?.count || 0,
      totalSize: (fileCount as any)?.total_size || 0,
    };
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  let userId: string | null = null;
  try {
    const authResult = await auth();
    userId = authResult.userId;
  } catch {
    redirect("/");
  }

  if (!userId) redirect("/sign-in");

  const data = await getDashboardData(userId);

  return <DashboardClient userId={userId} data={data} />;
}

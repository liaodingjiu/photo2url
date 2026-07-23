import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { headers } from "next/headers";
import DashboardClient from "./DashboardClient";

export const runtime = "edge";

const BYPASS_AUTH = process.env.DEV_BYPASS_AUTH === "true";

async function getDashboardData(userId: string) {
  try {
    const db = (process.env as any).DB;
    if (!db) return null;

    const user = await db
      .prepare("SELECT plan_type, storage_used FROM users WHERE id = ?")
      .bind(userId)
      .first();

    const today = new Date().toISOString().split("T")[0];
    const uploadCount = await db
      .prepare(
        `SELECT COUNT(*) as today_count
         FROM files
         WHERE user_id = ? AND date(created_at) = ?`
      )
      .bind(userId, today)
      .first();

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
  // Dev bypass: mock user + data + file list
  if (BYPASS_AUTH) {
    const dict = await getDictionary("en");
    const mockFiles = Array.from({ length: 7 }, (_, i) => ({
      id: `mock_${i + 1}`,
      original_name: `photo_${i + 1}.${i % 3 === 0 ? "png" : i % 3 === 1 ? "jpg" : "webp"}`,
      file_size: [2450000, 820000, 15000000, 430000, 5600000, 1200000, 980000][i],
      mime_type: `image/${i % 3 === 0 ? "png" : i % 3 === 1 ? "jpeg" : "webp"}`,
      created_at: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
      expires_at: i === 0 ? new Date(Date.now() + 30 * 86400000).toISOString() : null,
      r2_key: `mock/r2-key-${i + 1}`,
    }));
    const totalSize = mockFiles.reduce((sum, f) => sum + f.file_size, 0);
    const mockData = {
      planType: "free",
      storageUsed: totalSize,
      uploadsToday: 3,
      fileCount: mockFiles.length,
      totalSize,
    };
    return <DashboardClient userId="dev_user_001" data={mockData} files={mockFiles} dict={dict} />;
  }

  let userId: string | null = null;
  try {
    const authResult = await auth();
    userId = authResult.userId;
  } catch {
    redirect("/");
  }

  if (!userId) redirect("/sign-in");

  // Detect locale from middleware header
  let locale = "en";
  try {
    const headersList = await headers();
    locale = headersList.get("x-locale") || "en";
  } catch {
    /* fallback to en */
  }

  const dict = await getDictionary(locale);
  const data = await getDashboardData(userId);

  return <DashboardClient userId={userId} data={data} dict={dict} />;
}

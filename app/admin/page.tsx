import { auth } from "@clerk/nextjs/server";
import { getDictionary } from "@/lib/i18n";
import AdminClient from "./AdminClient";

export const runtime = "edge";

export default async function AdminPage() {
  const dict = await getDictionary("en");

  const { userId } = await auth();
  let user = null;
  if (userId) {
    try {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const clerk = await clerkClient();
      user = await clerk.users.getUser(userId);
    } catch { /* ignore */ }
  }

  const userName =
    user?.firstName || user?.emailAddresses?.[0]?.emailAddress || "Admin";

  return <AdminClient userId={userId!} userName={userName} dict={dict} />;
}

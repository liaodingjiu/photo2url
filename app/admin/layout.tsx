import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const runtime = "edge";

const BYPASS_AUTH = process.env.DEV_BYPASS_AUTH === "true";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (BYPASS_AUTH) return <>{children}</>;

  try {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const metadata = user.publicMetadata as Record<string, unknown>;

    if (metadata.role !== "admin") redirect("/dashboard");
  } catch {
    redirect("/dashboard");
  }

  return <>{children}</>;
}

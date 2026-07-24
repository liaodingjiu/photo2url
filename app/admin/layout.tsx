import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const runtime = "edge";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

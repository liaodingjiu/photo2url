import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import FileList from "@/components/FileList";
import { Card, CardContent } from "@/components/ui/card";
import { HardDrive, Upload } from "lucide-react";

export const runtime = "edge";

export default async function DashboardPage() {
  // Gracefully handle missing Clerk configuration
  let userId: string | null = null;
  try {
    const authResult = await auth();
    userId = authResult.userId;
  } catch {
    // Clerk not configured — redirect to home
    redirect("/");
  }

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 mb-8">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <HardDrive className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                  <p className="text-2xl font-bold">0 MB</p>
                  <p className="text-xs text-muted-foreground">of 100 GB (Plus)</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today&apos;s Uploads</p>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">of 1,000 daily limit</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Storage Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-1">
              <span>Storage Usage</span>
              <span className="text-muted-foreground">0%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: "0%" }}
              />
            </div>
          </div>

          {/* File List */}
          <FileList />
        </div>
      </main>
    </>
  );
}

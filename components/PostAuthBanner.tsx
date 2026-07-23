"use client";

import { Check, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PostAuthBanner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-4 text-center">
        <div className="rounded-full bg-green-100 dark:bg-green-900/30 w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">You&apos;re signed in!</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Welcome to photo2url. Manage your uploads from the dashboard.
        </p>
        <div className="space-y-3">
          <a href="/dashboard">
            <Button className="w-full">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
          <div>
            <a
              href="/"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              Go to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

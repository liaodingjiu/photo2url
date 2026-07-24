"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/**
 * Listens for Clerk authentication state changes and refreshes the Next.js
 * router so Server Components re-render with the new auth state.
 */
export default function ClerkListener() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const wasSignedIn = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    // User just signed in — refresh to re-render server components
    if (isSignedIn && !wasSignedIn.current) {
      router.refresh();
    }

    wasSignedIn.current = isSignedIn;
  }, [isSignedIn, isLoaded, router]);

  return null;
}

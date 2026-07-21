"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

/**
 * Listens for Clerk authentication events and shows welcome messages.
 */
export default function ClerkListener() {
  const { isSignedIn, user } = useUser();
  const prevSignedIn = useRef(isSignedIn);

  useEffect(() => {
    // User just signed in (login or register)
    if (isSignedIn && !prevSignedIn.current) {
      toast.success(`Welcome${user?.firstName ? `, ${user.firstName}` : ""}!`, {
        description: "You're now signed in to photo2url.",
      });
    }
    prevSignedIn.current = isSignedIn;
  }, [isSignedIn, user]);

  return null; // No UI — just side effects
}

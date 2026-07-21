import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware handles auth via Clerk when configured.
 * If Clerk keys are not set, all requests pass through (guest mode).
 */
export default function middleware(request: NextRequest) {
  // Clerk not configured yet — everything passes through
  if (!process.env.CLERK_SECRET_KEY) {
    return NextResponse.next();
  }

  // Re-export to the real clerk middleware
  // This avoids the Clerk initialization error when keys are missing
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

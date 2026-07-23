"use client";

import { useAuth, SignUp } from "@clerk/nextjs";
import { PostAuthBanner } from "@/components/PostAuthBanner";

export default function SignUpForm() {
  // Client-side catch: Clerk just completed sign-up but fallbackRedirectUrl
  // didn't fire (e.g. under @cloudflare/next-on-pages). useAuth() reacts to
  // the session cookie change and re-renders.
  const { isSignedIn } = useAuth();
  if (isSignedIn) return <PostAuthBanner />;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs mx-auto">
            Unlock Dashboard: file management, copy links (URL, HTML, Markdown), and more.
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border-0",
            },
          }}
          signInUrl="/sign-in"
          fallbackRedirectUrl="/dashboard"
        />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <a href="/sign-in" className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

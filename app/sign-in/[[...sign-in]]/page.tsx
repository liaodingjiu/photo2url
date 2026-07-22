import { SignIn } from "@clerk/nextjs";

export const runtime = "edge";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Welcome back to photo2url
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border-0",
            },
          }}
          signUpUrl="/sign-up"
        />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a href="/sign-up" className="text-primary hover:underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}

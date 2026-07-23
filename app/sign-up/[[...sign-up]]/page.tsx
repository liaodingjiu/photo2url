import { auth } from "@clerk/nextjs/server";
import { PostAuthBanner } from "@/components/PostAuthBanner";
import SignUpForm from "./SignUpForm";

export const runtime = "edge";

export default async function SignUpPage() {
  // Server-side check: catch the case where Clerk redirect failed
  // and the user manually navigates back or refreshes the page.
  const { userId } = await auth();
  if (userId) return <PostAuthBanner />;

  // Client-side fallback inside SignUpForm checks useAuth() too
  return <SignUpForm />;
}

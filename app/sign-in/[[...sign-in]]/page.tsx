import { auth } from "@clerk/nextjs/server";
import { PostAuthBanner } from "@/components/PostAuthBanner";
import SignInForm from "./SignInForm";

export const runtime = "edge";

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) return <PostAuthBanner />;

  return <SignInForm />;
}

import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getDictionary, getAlternateLinks } from "@/lib/i18n";
import LocaleHomeClient from "./[locale]/LocaleHomeClient";

export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary("en");
  const alternates = getAlternateLinks("/");

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: "https://photo2url.com",
      languages: Object.fromEntries(
        alternates.map(({ hreflang, href }) => [hreflang, href])
      ),
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      url: "https://photo2url.com",
      siteName: "photo2url",
      type: "website",
    },
  };
}

async function getUserPlanType(userId: string): Promise<string> {
  try {
    const db = (process.env as any).DB;
    if (!db) return "free";
    const row = await db
      .prepare("SELECT plan_type FROM users WHERE id = ?")
      .bind(userId)
      .first();
    return row?.plan_type || "free";
  } catch {
    return "free";
  }
}

export default async function RootPage() {
  const dict = await getDictionary("en");
  let planType = "free";
  try {
    const { userId } = await auth();
    if (userId) planType = await getUserPlanType(userId);
  } catch {
    /* guest user */
  }

  return (
    <LocaleHomeClient locale={"en" as const} dict={dict} planType={planType} />
  );
}

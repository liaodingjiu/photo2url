import { auth } from "@clerk/nextjs/server";
import { getDictionary, type Locale, locales } from "@/lib/i18n";
import { notFound } from "next/navigation";
import LocaleHomeClient from "./LocaleHomeClient";

export const runtime = "edge";

async function getUserPlanType(userId: string): Promise<string> {
  try {
    const db = (process.env as any).DB;
    if (!db) return "free";
    const row = await db.prepare("SELECT plan_type FROM users WHERE id = ?").bind(userId).first();
    return row?.plan_type || "free";
  } catch {
    return "free";
  }
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const dict = await getDictionary(locale);
  let planType = "free";
  try {
    const { userId } = await auth();
    if (userId) planType = await getUserPlanType(userId);
  } catch { /* guest user */ }

  return <LocaleHomeClient locale={locale as Locale} dict={dict} planType={planType} />;
}

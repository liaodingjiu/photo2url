import { getDictionary, type Locale, locales } from "@/lib/i18n";
import { notFound } from "next/navigation";
import LocaleHomeClient from "./LocaleHomeClient";

export const runtime = "edge";

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

  return <LocaleHomeClient locale={locale as Locale} dict={dict} />;
}

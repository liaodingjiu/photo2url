import { getDictionary, type Locale, locales } from "@/lib/i18n";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import LanguageSelector from "@/components/LanguageSelector";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: `${dict.terms.title} — photo2url`,
    description: dict.terms.content.slice(0, 160),
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      <Navbar dict={dict} />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-3xl font-bold mb-6">{dict.terms.title}</h1>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {dict.terms.content}
          </p>
        </div>
      </main>
      <LanguageSelector currentLocale={locale as Locale} />
      <Footer dict={dict} locale={locale as Locale} />
    </>
  );
}

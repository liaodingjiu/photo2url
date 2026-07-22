import type { Metadata } from "next";
import { getDictionary, getAlternateLinks, locales } from "@/lib/i18n";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const normalizedPath = locale === "en" ? "" : `/${locale}`;

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `https://photo2url.com${normalizedPath}`,
      languages: Object.fromEntries(
        locales.map((l) => {
          const href =
            l === "en"
              ? "https://photo2url.com"
              : `https://photo2url.com/${l}`;
          return [l, href];
        })
      ),
    },
    other: {
      ...Object.fromEntries(
        getAlternateLinks(`/${locale}`).map(({ hreflang, href }) => [
          `alternate:${hreflang}`,
          href,
        ])
      ),
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      url: `https://photo2url.com${normalizedPath}`,
      siteName: "photo2url",
      type: "website",
    },
  };
}

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

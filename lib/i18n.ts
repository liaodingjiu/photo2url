/**
 * i18n utilities for photo2url.com multi-language support.
 * Subdirectory routing: /en/, /zh-CN/, etc. Root / → 301 to /en/.
 */

export const locales = ["en", "zh-CN", "zh-TW", "ja", "ko", "es", "de", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

const localeLabels: Record<Locale, { native: string; flag: string }> = {
  en: { native: "English", flag: "🇬🇧" },
  "zh-CN": { native: "简体中文", flag: "🇨🇳" },
  "zh-TW": { native: "繁體中文", flag: "🇹🇼" },
  ja: { native: "日本語", flag: "🇯🇵" },
  ko: { native: "한국어", flag: "🇰🇷" },
  es: { native: "Español", flag: "🇪🇸" },
  de: { native: "Deutsch", flag: "🇩🇪" },
  fr: { native: "Français", flag: "🇫🇷" },
};

export function getLocaleLabel(locale: Locale) {
  return localeLabels[locale] ?? localeLabels.en;
}

/** Load translation dictionary for a locale, falling back to English. */
export async function getDictionary(locale: string): Promise<Dictionary> {
  try {
    const mod = await import(`@/messages/${locale}.json`);
    return mod.default ?? mod;
  } catch {
    const fallback = await import("@/messages/en.json");
    return fallback.default ?? fallback;
  }
}

/** Generate hreflang alternate links for all locales. */
export function getAlternateLinks(pathname: string): AlternateLink[] {
  // Strip locale prefix to get the page path
  const pagePath = pathname.replace(/^\/(en|zh-CN|zh-TW|ja|ko|es|de|fr)(\/|$)/, "/$2");
  const normalized = pagePath === "/" ? "" : pagePath;

  return locales.map((locale) => ({
    hreflang: locale,
    href: `https://photo2url.com/${locale}${normalized}`,
  }));
}

export interface AlternateLink {
  hreflang: string;
  href: string;
}

/** Detect best locale from Accept-Language header (server-side). */
export function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const preferred = acceptLanguage
    .split(",")
    .map((entry) => {
      const [tag, q = "1"] = entry.trim().split(";q=");
      return { tag: tag.trim(), q: parseFloat(q) };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of preferred) {
    // Exact match (zh-CN, zh-TW)
    if (locales.includes(tag as Locale)) return tag as Locale;
    // Match by primary language (zh → zh-CN, ja → ja, etc.)
    const primary = tag.split("-")[0];
    const match = locales.find((l) => l.startsWith(primary));
    if (match) return match;
  }

  return defaultLocale;
}

// =============== Dictionary Type ===============

export interface Dictionary {
  meta: { title: string; description: string };
  site: { name: string; tagline: string };
  hero: { title: string; subtitle: string };
  upload: {
    title: string;
    dragDrop: string;
    pasteHint: string;
    formats: string;
    maxSize: string;
    uploading: string;
    success: string;
    failed: string;
    verify: string;
  };
  howItWorks: {
    title: string;
    step1: { title: string; desc: string };
    step2: { title: string; desc: string };
    step3: { title: string; desc: string };
  };
  useCases: {
    title: string;
    items: { title: string; desc: string }[];
  };
  pricing: {
    title: string;
    subtitle: string;
    cta: string;
    plans: {
      enterprise: {
        name: string;
        badge: string;
        features: string[];
        cta: string;
      };
      plus: {
        name: string;
        features: string[];
        cta: string;
      };
      free: {
        name: string;
        features: string[];
        cta: string;
      };
    };
  };
  partners: {
    title: string;
  };
  footer: {
    brand: { description: string };
    product: { title: string; pricing: string; upload: string };
    legal: { title: string; privacy: string; terms: string; refund: string };
    contact: { title: string };
    copyright: string;
  };
  nav: {
    tools: string;
    pricing: string;
    login: string;
    signup: string;
    dashboard: string;
  };
  language: {
    selectRegion: string;
    chooseLang: string;
  };
  privacy: { title: string; content: string };
  terms: { title: string; content: string };
  refund: { title: string; content: string };
}

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
    href:
      locale === "en"
        ? `https://photo2url.com${normalized}`
        : `https://photo2url.com/${locale}${normalized}`,
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
  hero: { title: string; subtitle: string; titleHighlight?: string; trustLine: string };
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
    trySample: string;
    tryAnother: string;
    dropHere: string;
    signupTitle: string;
    signupDesc: string;
    signupCta: string;
  };
  howItWorks: {
    title: string;
    subtitle: string;
    step1: { title: string; desc: string };
    step2: { title: string; desc: string };
    step3: { title: string; desc: string };
  };
  useCases: {
    title: string;
    subtitle: string;
    items: { title: string; desc: string }[];
  };
  forEveryPhoto: {
    title: string;
    family: { title: string; desc: string };
    team: { title: string; desc: string };
    creator: { title: string; desc: string };
  };
  faq: {
    title: string;
    items: { question: string; answer: string }[];
  };
  about: {
    title: string;
    lead: string;
    problemHeading: string;
    problemBody: string;
    solutionHeading: string;
    solutionBody: string;
    techBody: string;
  };
  dashboard: {
    title: string;
    tabs: { overview: string; profile: string; billing: string };
    overview: {
      heading: string;
      storage: string;
      resources: string;
      resourcesDesc: string;
      dailyUploads: string;
      dailyReset: string;
      plan: string;
      planActive: string;
      storageUsage: string;
      myPhotos: string;
      noFiles: string;
      noFilesHint: string;
      uploadCta: string;
      loading: string;
    };
    billing: {
      heading: string;
      description: string;
      currentPlan: string;
      upgradeDesc: string;
      active: string;
      features: string[];
      storageUsage: string;
      upgradeTitle: string;
      upgradeCta: string;
    };
  };
  pricing: {
    title: string;
    subtitle: string;
    enterpriseHint: string;
    plans: {
      enterprise: { name: string; cta: string };
      plus: { name: string; cta: string };
      free: { name: string; cta: string };
    };
    rows: {
      label: string;
      enterprise: string | boolean;
      plus: string | boolean;
      free: string | boolean;
    }[];
  };
  whyChoose: {
    title: string;
    subtitle: string;
    items: { title: string; desc: string }[];
  };
  teamsSaving: {
    title: string;
    subtitle: string;
    stats: { value: string; label: string }[];
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
    home: string;
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

"use client";

import { locales, getLocaleLabel, type Locale } from "@/lib/i18n";

export default function LanguageSelector({
  currentLocale,
}: {
  currentLocale: Locale;
}) {
  const handleSelect = (locale: Locale) => {
    if (locale === currentLocale) return;
    document.cookie = `locale=${locale};path=/;max-age=31536000`;
    const pathParts = window.location.pathname
      .replace(/^\/(en|zh-CN)(\/?)/, "/")
      .replace(/^\/+/, "");
    window.location.href = `/${locale}${pathParts ? `/${pathParts}` : ""}`;
  };

  return (
    <div className="border-t py-6 bg-muted/10">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="text-xs text-muted-foreground mb-3">Language</p>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm">
          {locales.map((locale) => {
            const { native } = getLocaleLabel(locale);
            const isActive = locale === currentLocale;
            return (
              <button
                key={locale}
                onClick={() => handleSelect(locale)}
                className={`inline-flex items-center gap-1 rounded px-3 py-1.5 transition-colors
                  ${isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
              >
                {native}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

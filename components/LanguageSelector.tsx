"use client";

import { locales, getLocaleLabel, type Locale, type Dictionary } from "@/lib/i18n";

export default function LanguageSelector({
  currentLocale,
  dict,
}: {
  currentLocale: Locale;
  dict?: Dictionary;
}) {
  const l = dict?.language;
  const handleSelect = (locale: Locale) => {
    if (locale === currentLocale) return;
    document.cookie = `locale=${locale};path=/;max-age=31536000`;
    const pathParts = window.location.pathname
      .replace(/^\/(en|zh-CN)(\/?)/, "/")
      .replace(/^\/+/, "");
    window.location.href = `/${locale}${pathParts ? `/${pathParts}` : ""}`;
  };

  return (
    <section className="border-t py-12 bg-muted/10">
      <div className="mx-auto max-w-6xl px-4 text-center">
        {l?.title && (
          <h2 className="text-2xl font-bold tracking-tight">{l.title}</h2>
        )}
        {l?.subtitle && (
          <p className="mt-2 text-sm text-muted-foreground">{l.subtitle}</p>
        )}
        <div className="mt-6" />
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
    </section>
  );
}

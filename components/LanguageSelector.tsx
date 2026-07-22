"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { locales, getLocaleLabel, type Locale } from "@/lib/i18n";

export default function LanguageSelector({
  currentLocale,
}: {
  currentLocale: Locale;
}) {
  const handleSelect = (locale: Locale) => {
    // Set cookie for middleware detection
    document.cookie = `locale=${locale};path=/;max-age=31536000`; // 1 year

    // Navigate to same page in new locale
    const pathParts = window.location.pathname
      .replace(/^\/(en|zh-CN|zh-TW|ja|ko|es|de|fr)(\/?)/, "/")
      .replace(/^\/+/, "");
    window.location.href = `/${locale}${pathParts ? `/${pathParts}` : ""}`;
  };

  const current = getLocaleLabel(currentLocale);

  return (
    <div className="border-t py-8 bg-muted/10">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline" size="sm" className="gap-2">
              <Globe className="h-4 w-4" />
              <span className="mr-1">{current.flag}</span>
              {current.native}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="max-h-80 overflow-y-auto w-52"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                Select Region
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            {locales.map((locale) => {
              const { native, flag } = getLocaleLabel(locale);
              return (
                <DropdownMenuItem
                  key={locale}
                  onClick={() => handleSelect(locale)}
                  className="gap-2 cursor-pointer"
                >
                  <span>{flag}</span>
                  <span>{native}</span>
                  {locale === currentLocale && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      ✓
                    </span>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

"use client";

import Navbar from "@/components/Navbar";
import UploadZone from "@/components/UploadZone";
import HowItWorks from "@/components/HowItWorks";
import UseCases from "@/components/UseCases";
import PricingSection from "@/components/PricingSection";
import PartnerBanner from "@/components/PartnerBanner";
import Footer from "@/components/Footer";
import LanguageSelector from "@/components/LanguageSelector";
import { Separator } from "@/components/ui/separator";
import type { Dictionary, Locale } from "@/lib/i18n";

export default function LocaleHomeClient({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <>
      <Navbar dict={dict} />
      <main className="flex-1">
        {/* Hero + Upload */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {dict.hero.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {dict.hero.subtitle}
            </p>
          </div>
          <div id="upload-zone" className="mt-10 px-4">
            <UploadZone dict={dict} />
          </div>
        </section>

        <Separator />

        <HowItWorks dict={dict} />
        <UseCases dict={dict} />
        <PricingSection dict={dict} />
        <PartnerBanner dict={dict} />
      </main>

      <LanguageSelector currentLocale={locale} />
      <Footer dict={dict} locale={locale} />
    </>
  );
}

"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import UploadZone from "@/components/UploadZone";
import type { UploadResult } from "@/components/UploadZone";
import HowItWorks from "@/components/HowItWorks";
import WhyChoose from "@/components/WhyChoose";
import UseCases from "@/components/UseCases";
import TeamsSaving from "@/components/TeamsSaving";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";
import LanguageSelector from "@/components/LanguageSelector";
import PostUploadSignup from "@/components/PostUploadSignup";
import DemoImage from "@/components/DemoImage";
import ResultCard from "@/components/ResultCard";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@clerk/nextjs";
import type { Dictionary, Locale } from "@/lib/i18n";

export default function LocaleHomeClient({
  locale,
  dict,
  planType = "free",
}: {
  locale: Locale;
  dict: Dictionary;
  planType?: string;
}) {
  const { isSignedIn } = useAuth();
  const [hasUploaded, setHasUploaded] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  return (
    <>
      <Navbar dict={dict} />
      <main className="flex-1">
        {/* Hero + Upload */}
        <section className="py-8 lg:py-12">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {dict.hero.title}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              {dict.hero.subtitle}
            </p>
            <p className="mt-2 text-sm text-muted-foreground/60">
              {dict.hero.trustTags}
            </p>
          </div>
          <div
            id="upload-zone"
            className="mt-8 px-4 scroll-mt-20 target:ring-2 target:ring-primary/50 target:rounded-xl transition-all duration-700"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 max-w-5xl mx-auto">
              {/* Left column */}
              <div>
                <UploadZone
                  dict={dict}
                  planType={planType}
                  onUploadSuccess={() => {
                    if (!isSignedIn) setHasUploaded(true);
                  }}
                  onUploadResult={setUploadResult}
                />
                {hasUploaded && !isSignedIn && <PostUploadSignup dict={dict} />}
              </div>
              {/* Right column: demo → result */}
              {uploadResult ? (
                <ResultCard result={uploadResult} />
              ) : (
                <DemoImage variant="demo" />
              )}
            </div>
          </div>
        </section>

        <Separator />

        <HowItWorks dict={dict} />
        <WhyChoose dict={dict} />
        <UseCases dict={dict} />
        <TeamsSaving dict={dict} />
        <PricingSection dict={dict} />
      </main>

      <LanguageSelector currentLocale={locale} />
      <Footer dict={dict} locale={locale} />
    </>
  );
}

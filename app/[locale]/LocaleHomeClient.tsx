"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import UploadZone from "@/components/UploadZone";
import type { UploadResult } from "@/components/UploadZone";
import HowItWorks from "@/components/HowItWorks";
import FeatureHighlights from "@/components/FeatureHighlights";
import WhyChoose from "@/components/WhyChoose";
import UseCases from "@/components/UseCases";
import TeamsSaving from "@/components/TeamsSaving";
import ForEveryPhoto from "@/components/ForEveryPhoto";
import PricingSection from "@/components/PricingSection";
import HomeFaq from "@/components/HomeFaq";
import AboutPhoto2Url from "@/components/AboutPhoto2Url";
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
  let isSignedIn = false;
  try { const auth = useAuth(); isSignedIn = auth.isSignedIn ?? false; } catch { /* Clerk not available */ }
  const [hasUploaded, setHasUploaded] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  return (
    <>
      <Navbar dict={dict} />
      <main className="flex-1">
        {/* Hero + Upload */}
        <section className="flex flex-col justify-center min-h-[calc(100vh-64px)] py-8 lg:py-12">
          <div
            id="upload-zone"
            className="px-4 scroll-mt-20 target:ring-2 target:ring-primary/50 target:rounded-xl transition-all duration-700"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 max-w-5xl mx-auto items-start">
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
        <ForEveryPhoto dict={dict} />
        <WhyChoose dict={dict} />
        <FeatureHighlights dict={dict} />
        <UseCases dict={dict} />
        <TeamsSaving dict={dict} />
        <PricingSection dict={dict} />
        <HomeFaq dict={dict} />
        <AboutPhoto2Url dict={dict} />
      </main>

      <LanguageSelector currentLocale={locale} dict={dict} />
      <Footer dict={dict} locale={locale} />
    </>
  );
}

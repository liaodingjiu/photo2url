"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import UploadZone from "@/components/UploadZone";
import HowItWorks from "@/components/HowItWorks";
import UseCases from "@/components/UseCases";
import PricingSection from "@/components/PricingSection";
import PartnerBanner from "@/components/PartnerBanner";
import Footer from "@/components/Footer";
import LanguageSelector from "@/components/LanguageSelector";
import PostUploadSignup from "@/components/PostUploadSignup";
import DemoVideo from "@/components/DemoVideo";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@clerk/nextjs";
import type { Dictionary, Locale } from "@/lib/i18n";

export default function LocaleHomeClient({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const { isSignedIn } = useAuth();
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

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
          <div
            id="upload-zone"
            className="mt-10 px-4 scroll-mt-20 target:ring-2 target:ring-primary/50 target:rounded-xl transition-all duration-700"
          >
            <UploadZone
              dict={dict}
              demoView={<DemoVideo />}
              onUploadSuccess={() => {
                if (!isSignedIn) setShowSignupPrompt(true);
              }}
            />
            {showSignupPrompt && <PostUploadSignup dict={dict} />}
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

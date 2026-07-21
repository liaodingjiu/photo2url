import Navbar from "@/components/Navbar";
import UploadZone from "@/components/UploadZone";
import HowItWorks from "@/components/HowItWorks";
import UseCases from "@/components/UseCases";
import PricingSection from "@/components/PricingSection";
import PartnerBanner from "@/components/PartnerBanner";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero + Upload */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Free Image to URL Converter
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload images and get instant shareable links. No sign-up required.
              Perfect for Notion, Reddit, GitHub, Jira, and everywhere else.
            </p>
          </div>
          <div id="upload-zone" className="mt-10 px-4">
            <UploadZone />
          </div>

          {/* Sample images */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              No image? Try these samples
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              {[
                { label: "Red", bg: "bg-red-200" },
                { label: "Blue", bg: "bg-blue-200" },
                { label: "Green", bg: "bg-green-200" },
              ].map((sample) => (
                <div
                  key={sample.label}
                  className={`h-24 w-24 rounded-lg flex items-center justify-center text-xs font-medium text-muted-foreground cursor-pointer hover:ring-2 ring-primary transition-all ${sample.bg}`}
                  title={`Sample ${sample.label} image`}
                >
                  {sample.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* 3-Step Guide */}
        <HowItWorks />

        {/* Use Cases */}
        <UseCases />

        {/* Pricing */}
        <PricingSection />

        {/* Partners */}
        <PartnerBanner />
      </main>

      <Footer />
    </>
  );
}

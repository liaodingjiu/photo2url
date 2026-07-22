import type { Dictionary } from "@/lib/i18n";

export default function AboutPhoto2Url({ dict }: { dict: Dictionary }) {
  const t = dict.about;

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Photo2URL",
    url: "https://photo2url.com",
    description:
      "Free online photo to url converter. Upload PNG, JPG, WEBP, or GIF and get a direct HTTPS link in one step. No sign-up required.",
    applicationCategory: "Multimedia",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    provider: {
      "@type": "Organization",
      name: "Photo2URL",
    },
  };

  return (
    <section className="py-14">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center text-3xl font-bold mb-8">{t.title}</h2>

        <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-6">
          {/* Lead */}
          <p className="text-base leading-relaxed">{t.lead}</p>

          {/* Problem */}
          <h3 className="text-lg font-semibold text-foreground mt-10">
            {t.problemHeading}
          </h3>
          <p className="leading-relaxed">{t.problemBody}</p>

          {/* Solution */}
          <h3 className="text-lg font-semibold text-foreground mt-10">
            {t.solutionHeading}
          </h3>
          <p className="leading-relaxed">{t.solutionBody}</p>

          {/* Tech details */}
          <p className="leading-relaxed">{t.techBody}</p>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
        />
      </div>
    </section>
  );
}

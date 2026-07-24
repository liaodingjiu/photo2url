import type { Dictionary } from "@/lib/i18n";

export default function HomeFaq({ dict }: { dict: Dictionary }) {
  const t = dict.faq;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="py-14 bg-muted/20">
      <div className="mx-auto max-w-2xl px-4">
        <h2 className="text-center text-3xl font-bold mb-10">{t.title}</h2>

        <div className="space-y-3">
          {t.items.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card px-5 py-4"
            >
              <p className="text-sm font-medium mb-2">{item.question}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </div>
    </section>
  );
}

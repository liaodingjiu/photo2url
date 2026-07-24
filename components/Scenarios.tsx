import type { Dictionary } from "@/lib/i18n";

export default function Scenarios({ dict }: { dict: Dictionary }) {
  const t = dict.scenarios;

  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: t.items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.title,
      description: item.desc,
    })),
  };

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold mb-4">{t.title}</h2>
        <p className="text-center text-muted-foreground mb-12">{t.subtitle}</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.items.map((item) => (
            <div
              key={item.title}
              className="group rounded-xl border bg-card p-5 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <span className="text-2xl">{item.emoji}</span>
              <h3 className="mt-3 font-semibold text-sm">{item.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
              <a
                href="/#upload-zone"
                className="mt-3 inline-block text-xs text-primary hover:underline"
              >
                Try it now →
              </a>
            </div>
          ))}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
        />
      </div>
    </section>
  );
}

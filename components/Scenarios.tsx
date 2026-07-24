import { Palette, BookOpen, Bug, LifeBuoy, Presentation, Share2 } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

const ICONS = [Palette, BookOpen, Bug, LifeBuoy, Presentation, Share2];

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
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="text-center text-3xl font-bold mb-2">{t.title}</h2>
        <p className="text-center text-muted-foreground mb-12">{t.subtitle}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          {t.items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <div
                key={item.title}
                className="group rounded-xl border bg-card p-5 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 font-semibold text-sm">{item.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
                <a
                  href="/#upload-zone"
                  className="mt-3 inline-block text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Try it now →
                </a>
              </div>
            );
          })}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
        />
      </div>
    </section>
  );
}

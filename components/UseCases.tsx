import { MessageCircle, ExternalLink, Briefcase, Headphones, ShoppingCart, Code } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

const ICONS = [
  MessageCircle,
  ExternalLink,
  Code,
  Briefcase,
  Headphones,
  ShoppingCart,
];

export default function UseCases({ dict }: { dict: Dictionary }) {
  const t = dict.useCases;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold mb-4">{t.title}</h2>
        <p className="text-center text-muted-foreground mb-12">
          {t.subtitle}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.items.map((item, i) => {
            const Icon = ICONS[i] || MessageCircle;
            return (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <Icon className="h-6 w-6 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-base">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

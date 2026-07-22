import { ClipboardPaste, Zap, Copy, Shield, UserPlus, Link } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

const ICONS = [ClipboardPaste, Zap, Copy, Shield, UserPlus, Link];

export default function FeatureHighlights({ dict }: { dict: Dictionary }) {
  const t = dict.featureHighlights;

  return (
    <section className="py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold mb-2">{t.title}</h2>
        <p className="text-center text-muted-foreground mb-10">{t.subtitle}</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.items.map((item, i) => {
            const Icon = ICONS[i] || Link;
            return (
              <div
                key={item.title}
                className="flex flex-col items-center rounded-xl border bg-card p-8 text-center"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

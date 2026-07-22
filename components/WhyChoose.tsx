import { ClipboardPaste, Image } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

const ICONS = [ClipboardPaste, Image];

export default function WhyChoose({ dict }: { dict: Dictionary }) {
  const t = dict.whyChoose;

  return (
    <section className="py-14 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold mb-2">{t.title}</h2>
        <p className="text-center text-muted-foreground mb-10">{t.subtitle}</p>
        <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
          {t.items.map((item, i) => {
            const Icon = ICONS[i] || ClipboardPaste;
            return (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

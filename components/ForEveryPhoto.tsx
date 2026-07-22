import { Users, Building2, Palette } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

const SCENES = [
  { key: "family" as const, icon: Users },
  { key: "team" as const, icon: Building2 },
  { key: "creator" as const, icon: Palette },
];

export default function ForEveryPhoto({ dict }: { dict: Dictionary }) {
  const t = dict.forEveryPhoto;

  return (
    <section className="py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold mb-2">{t.title}</h2>
        <div className="grid gap-6 md:grid-cols-3 mt-10">
          {SCENES.map(({ key, icon: Icon }) => {
            const item = t[key];
            return (
              <div
                key={key}
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

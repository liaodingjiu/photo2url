import { TrendingUp, Clock, Users } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

const ICONS = [TrendingUp, Clock, Users];

export default function TeamsSaving({ dict }: { dict: Dictionary }) {
  const t = dict.teamsSaving;

  return (
    <section className="py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold mb-2">{t.title}</h2>
        <p className="text-center text-muted-foreground mb-10">{t.subtitle}</p>
        <div className="grid gap-6 md:grid-cols-3">
          {t.stats.map((stat, i) => {
            const Icon = ICONS[i] || TrendingUp;
            return (
              <div
                key={stat.value}
                className="flex flex-col items-center rounded-xl border bg-card p-8 text-center"
              >
                <Icon className="h-8 w-8 text-primary mb-4" />
                <span className="text-4xl font-extrabold text-primary mb-2">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

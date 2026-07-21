import type { Dictionary } from "@/lib/i18n";

export default function PartnerBanner({ dict }: { dict: Dictionary }) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-bold mb-8">
          {dict.partners.title}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center justify-center h-12 px-6 rounded-lg border border-dashed border-muted-foreground/30 text-sm text-muted-foreground">
            Your Logo Here
          </div>
          <div className="flex items-center justify-center h-12 px-6 rounded-lg border border-dashed border-muted-foreground/30 text-sm text-muted-foreground">
            Your Logo Here
          </div>
          <div className="flex items-center justify-center h-12 px-6 rounded-lg border border-dashed border-muted-foreground/30 text-sm text-muted-foreground">
            Your Logo Here
          </div>
          <div className="flex items-center justify-center h-12 px-6 rounded-lg border border-dashed border-muted-foreground/30 text-sm text-muted-foreground">
            Your Logo Here
          </div>
        </div>
      </div>
    </section>
  );
}

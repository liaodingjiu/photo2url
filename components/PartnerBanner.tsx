import type { Dictionary } from "@/lib/i18n";

const SIGNALS = [
  { icon: "🚀", text: "No sign-up required" },
  { icon: "⚡", text: "Instant upload & share" },
  { icon: "🌐", text: "Global CDN delivery" },
  { icon: "🔒", text: "Payments by Lemon Squeezy" },
];

export default function PartnerBanner({ dict }: { dict: Dictionary }) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-bold mb-8">
          {dict.partners.title}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {SIGNALS.map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 rounded-lg border bg-muted/30 px-5 py-3 text-sm font-medium text-muted-foreground"
            >
              <span className="text-base">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

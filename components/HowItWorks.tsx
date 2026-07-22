import { CloudUpload, Link, Share2 } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

export default function HowItWorks({ dict }: { dict: Dictionary }) {
  const t = dict.howItWorks;
  const steps = [
    { icon: CloudUpload, title: t.step1.title, description: t.step1.desc },
    { icon: Link, title: t.step2.title, description: t.step2.desc },
    { icon: Share2, title: t.step3.title, description: t.step3.desc },
  ];

  return (
    <section className="py-10 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold mb-8">{t.title}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm font-bold">
                {index + 1}
              </div>
              <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

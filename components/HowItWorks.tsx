import { CloudUpload, Link, Share2 } from "lucide-react";

const steps = [
  {
    icon: CloudUpload,
    title: "Drop",
    description: "Drag & drop, click, or paste your image. Any format — PNG, JPG, WEBP, GIF.",
  },
  {
    icon: Link,
    title: "Convert",
    description: "We instantly upload and generate a shareable URL. No sign-up required.",
  },
  {
    icon: Share2,
    title: "Share Anywhere",
    description: "Copy the link. Embed in Notion, Reddit, GitHub, Jira — anywhere that takes a URL.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold mb-12">
          How It Works
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
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

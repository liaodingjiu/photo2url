import { MessageCircle, ExternalLink, Briefcase, Headphones, ShoppingCart, Code } from "lucide-react";

const useCases = [
  { icon: MessageCircle, name: "Notion", desc: "Embed images in Notion pages & databases" },
  { icon: ExternalLink, name: "Reddit", desc: "Share screenshots & memes in comments" },
  { icon: Code, name: "GitHub", desc: "Add images to README, issues & PRs" },
  { icon: Briefcase, name: "Jira", desc: "Attach screenshots to tickets & reports" },
  { icon: Headphones, name: "Support", desc: "Share screenshots with customer support" },
  { icon: ShoppingCart, name: "E-commerce", desc: "Host product images for your store" },
];

export default function UseCases() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold mb-4">
          Use Everywhere
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          One link works on every platform. No formatting issues.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((item) => (
            <div
              key={item.name}
              className="flex items-start gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <item.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-sm">{item.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

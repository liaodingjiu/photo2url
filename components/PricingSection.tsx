"use client";

import { Check, X, Zap, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useAuth, useUser } from "@clerk/nextjs";
import type { Dictionary } from "@/lib/i18n";

const CHECKOUT_URLS: Record<string, string> = {
  Plus: "https://photo2url.lemonsqueezy.com/checkout/buy/a29b1d30-70b5-4a72-a467-99f2cc42cbdb",
  Enterprise: "https://photo2url.lemonsqueezy.com/checkout/buy/adfbbc5a-e7ff-4f48-a9c3-718e0ebbc7bb",
};

const PLAN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Enterprise: Crown,
  Plus: Zap,
  Free: Sparkles,
};

function detectCountry(): string | null {
  if (typeof navigator === "undefined") return null;
  const parts = navigator.language.split("-");
  if (parts.length === 2) return parts[1].toUpperCase();
  return null;
}

export default function PricingSection({ dict }: { dict: Dictionary }) {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const t = dict.pricing;

  const plans = [
    { key: "Enterprise", price: "$94.90", period: "/year" },
    { key: "Plus", price: "$9.90", period: "/month" },
    { key: "Free", price: "$0", period: "" },
  ] as const;

  const handleSubscribe = (planKey: string) => {
    if (planKey === "Free") {
      window.location.hash = "upload-zone";
      return;
    }

    const base = CHECKOUT_URLS[planKey];
    const params = new URLSearchParams();
    params.set("lang", "en");

    if (isSignedIn && userId) {
      params.set("checkout[custom][user_id]", userId);
      const email = user?.primaryEmailAddress?.emailAddress;
      if (email) params.set("checkout[email]", email);
      const name = user?.fullName;
      if (name) params.set("checkout[name]", name);
    }

    const country = detectCountry();
    if (country) params.set("checkout[billing_address][country]", country);

    params.set(
      "checkout[success_url]",
      `${window.location.origin}/dashboard?checkout=success`
    );

    window.location.href = `${base}?${params.toString()}`;
  };

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold mb-4">{t.title}</h2>
        <p className="text-center text-muted-foreground mb-12">{t.subtitle}</p>

        <div className="grid gap-6 lg:grid-cols-3 items-start">
          {plans.map((plan) => {
            const meta = t.plans[plan.key.toLowerCase() as "enterprise" | "plus" | "free"];
            const Icon = PLAN_ICONS[plan.key];

            return (
              <Card
                key={plan.key}
                className="relative shadow-2xl lg:scale-[1.04] rounded-xl
                           bg-gradient-to-b from-primary/5 to-transparent
                           hover:scale-[1.06] transition-all duration-300"
              >
                <CardHeader className="text-center pb-2">
                  {Icon && <Icon className="mx-auto h-8 w-8 text-primary mb-2" />}
                  <h3 className="text-xl font-bold">{meta.name}</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5">
                    {t.rows.map((row) => {
                      const value = row[plan.key.toLowerCase() as "enterprise" | "plus" | "free"];
                      return (
                        <li key={row.label} className="flex items-start gap-2 text-sm">
                          {typeof value === "boolean" ? (
                            value ? (
                              <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                            ) : (
                              <X className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                            )
                          ) : (
                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          )}
                          <span>
                            {typeof value === "string" ? value : row.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button
                    className="w-full"
                    variant={plan.key === "Enterprise" ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleSubscribe(plan.key)}
                  >
                    {meta.cta}
                  </Button>
                  {plan.key === "Enterprise" && (
                    <p className="text-xs text-muted-foreground text-center">
                      {t.enterpriseHint}
                    </p>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

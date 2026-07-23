"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth, useUser } from "@clerk/nextjs";
import type { Dictionary } from "@/lib/i18n";

const CHECKOUT_URLS: Record<string, string> = {
  Plus: "https://photo2url.lemonsqueezy.com/checkout/buy/a29b1d30-70b5-4a72-a467-99f2cc42cbdb",
  Enterprise: "https://photo2url.lemonsqueezy.com/checkout/buy/adfbbc5a-e7ff-4f48-a9c3-718e0ebbc7bb",
};

function detectCountry(): string | null {
  if (typeof navigator === "undefined") return null;
  const parts = navigator.language.split("-");
  if (parts.length === 2) return parts[1].toUpperCase();
  return null;
}

export default function PricingSection({ dict }: { dict: Dictionary }) {
  let isSignedIn = false;
  let userId: string | null = null;
  let user: { primaryEmailAddress?: { emailAddress: string } | null; fullName?: string | null } | null | undefined = null;
  try {
    const auth = useAuth();
    isSignedIn = auth.isSignedIn ?? false;
    userId = auth.userId ?? null;
  } catch { /* Clerk not available */ }
  try { const u = useUser(); user = u.user; } catch { /* Clerk not available */ }
  const t = dict.pricing;

  const plans = [
    { key: "Free", price: "$0", period: "" as const, highlight: false as const, monthly: "" as const },
    { key: "Plus", price: "$9.90", period: "/month" as const, highlight: true as const, monthly: "" as const },
    { key: "Enterprise", price: "$94.90", period: "/year" as const, highlight: false as const, monthly: "~$7.91 /mo" as const },
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

            return (
              <Card
                key={plan.key}
                className={`flex flex-col ${plan.highlight ? "ring-2 ring-primary lg:-mt-2" : ""}`}
              >
                <CardContent className="flex flex-col p-0">
                  {/* Header */}
                  <div className="px-5 pt-6 pb-4 text-center">
                    {plan.highlight && (
                      <span className="inline-block rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground mb-2">
                        Most Popular
                      </span>
                    )}
                    <h3 className="text-lg font-bold">{meta.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-extrabold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    {plan.monthly !== "" && (
                      <p className="text-xs text-muted-foreground mt-1">{plan.monthly}</p>
                    )}
                  </div>

                  <Separator />

                  {/* Features */}
                  <div className="px-5 py-3 flex-1">
                    {t.rows.map((row) => {
                      const value = row[plan.key.toLowerCase() as "enterprise" | "plus" | "free"];
                      return (
                        <div
                          key={row.label}
                          className="flex items-center gap-2 py-2.5"
                        >
                          <span className="text-xs text-muted-foreground truncate min-w-0 flex-1">
                            {row.label}
                          </span>
                          <span className="text-sm font-medium shrink-0 text-right">
                            {typeof value === "string" ? value : row.label}
                          </span>
                          {typeof value === "boolean" && !value ? (
                            <X className="h-4 w-4 text-red-400 shrink-0" />
                          ) : (
                            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  {/* CTA */}
                  <div className="px-5 py-4">
                    <Button
                      className="w-full"
                      variant={plan.highlight ? "default" : "outline"}
                      size="lg"
                      onClick={() => handleSubscribe(plan.key)}
                    >
                      {meta.cta}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-muted-foreground text-center">
          {t.enterpriseHint}
        </p>
      </div>
    </section>
  );
}

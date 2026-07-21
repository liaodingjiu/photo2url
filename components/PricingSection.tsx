"use client";

import { Check, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useAuth, useUser } from "@clerk/nextjs";
import type { Dictionary } from "@/lib/i18n";

const CHECKOUT_URLS: Record<string, string> = {
  Plus: "https://photo2url.lemonsqueezy.com/checkout/buy/a29b1d30-70b5-4a72-a467-99f2cc42cbdb",
  Enterprise: "https://photo2url.lemonsqueezy.com/checkout/buy/adfbbc5a-e7ff-4f48-a9c3-718e0ebbc7bb",
};

/** Detect user's country from browser locale (e.g. "zh-CN" → "CN") */
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
    {
      key: "Enterprise",
      price: "$94.90",
      period: "/year",
      icon: Crown,
      highlight: true,
      badge: t.plans.enterprise.badge,
      features: t.plans.enterprise.features,
      cta: t.plans.enterprise.cta,
      name: t.plans.enterprise.name,
    },
    {
      key: "Plus",
      price: "$9.90",
      period: "/month",
      icon: Zap,
      highlight: false,
      badge: null,
      features: t.plans.plus.features,
      cta: t.plans.plus.cta,
      name: t.plans.plus.name,
    },
    {
      key: "Free",
      price: "$0",
      period: "",
      icon: null,
      highlight: false,
      badge: null,
      features: t.plans.free.features,
      cta: t.plans.free.cta,
      name: t.plans.free.name,
    },
  ];

  const handleSubscribe = (planKey: string) => {
    if (planKey === "Free") {
      document
        .getElementById("upload-zone")
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const base = CHECKOUT_URLS[planKey];
    const params = new URLSearchParams();
    params.set("lang", "en");

    // Logged-in user: pre-fill email, name, and user_id
    if (isSignedIn && userId) {
      params.set("checkout[custom][user_id]", userId);
      const email = user?.primaryEmailAddress?.emailAddress;
      if (email) params.set("checkout[email]", email);
      const name = user?.fullName;
      if (name) params.set("checkout[name]", name);
    }

    // Auto-detect country to avoid US address format validation
    const country = detectCountry();
    if (country) {
      params.set("checkout[billing_address][country]", country);
    }

    // Return to dashboard after successful payment
    params.set(
      "checkout[success_url]",
      `${window.location.origin}/dashboard?checkout=success`
    );

    window.location.href = `${base}?${params.toString()}`;
  };

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold mb-4">
          {t.title}
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          {t.subtitle}
        </p>

        <div className="grid gap-6 lg:grid-cols-3 items-start">
          {plans.map((plan) => (
            <Card
              key={plan.key}
              className={`relative ${
                plan.highlight
                  ? "border-primary shadow-lg ring-1 ring-primary scale-[1.02]"
                  : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  {plan.badge}
                </div>
              )}
              <CardHeader className="text-center pb-2">
                {plan.icon && <plan.icon className="mx-auto h-8 w-8 text-primary mb-2" />}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground ml-1">
                      {plan.period}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                  size="lg"
                  onClick={() => handleSubscribe(plan.key)}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { Check, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Enterprise",
    price: "$94.90",
    period: "/year",
    icon: Crown,
    highlight: true,
    badge: "Best Value",
    features: [
      "256 MB file size limit",
      "Unlimited daily uploads",
      "200 GB permanent storage",
      "PNG, JPG, WEBP, GIF",
      "Files never expire",
      "Priority support",
    ],
    cta: "Subscribe Now",
  },
  {
    name: "Plus",
    price: "$9.90",
    period: "/month",
    icon: Zap,
    highlight: false,
    badge: null,
    features: [
      "50 MB file size limit",
      "1,000 uploads/day",
      "100 GB permanent storage",
      "PNG, JPG, WEBP, GIF",
      "Files never expire",
    ],
    cta: "Subscribe Now",
  },
  {
    name: "Free",
    price: "$0",
    period: "",
    icon: null,
    highlight: false,
    badge: null,
    features: [
      "2 MB file size limit",
      "10 uploads/day",
      "200 MB total storage",
      "PNG, JPG, WEBP, GIF",
      "30-day auto cleanup",
      "No sign-up required",
    ],
    cta: "Start for Free",
  },
];

export default function PricingSection() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Static env lookup — dynamic process.env[key] doesn't work in Next.js client
  const VARIANT_IDS: Record<string, string | undefined> = {
    Plus: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PLUS_VARIANT_ID,
    Enterprise: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_ENTERPRISE_VARIANT_ID,
  };
  const STORE_ID = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID;

  const handleSubscribe = (plan: string) => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (plan === "Free") {
      document
        .getElementById("upload-zone")
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const variantId = VARIANT_IDS[plan];
    const storeId = STORE_ID;

    if (!variantId || !storeId) {
      alert("step1: store=" + storeId + " plan=" + plan + " variant=" + variantId);
      return;
    }

    import("@lemonsqueezy/lemonsqueezy.js")
      .then((ls) => {
        alert("step2: imported, calling createCheckout: store=" + storeId + " variant=" + variantId);
        ls.createCheckout(storeId, variantId);
      })
      .catch((err) => {
        alert("step3: import failed: " + err.message);
      });

  };

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold mb-4">
          Simple Pricing
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Start free. Upgrade when you need more.
        </p>

        <div className="grid gap-6 lg:grid-cols-3 items-start">
          {plans.map((plan) => (
            <Card
              key={plan.name}
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
                  onClick={() => handleSubscribe(plan.name)}
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

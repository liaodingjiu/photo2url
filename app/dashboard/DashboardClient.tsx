"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { UserProfile } from "@clerk/nextjs";
import {
  LayoutDashboard,
  User,
  CreditCard,
  Image,
  HardDrive,
  Upload,
  ArrowUpRight,
  Zap,
  Crown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FileList from "@/components/FileList";
import type { Dictionary } from "@/lib/i18n";

// =============== Types & Constants ===============

interface DashboardData {
  planType: string;
  storageUsed: number;
  uploadsToday: number;
  fileCount: number;
  totalSize: number;
}

type Tab = "overview" | "profile" | "billing";

const PLAN_LIMITS: Record<string, { storage: number; daily: number; label: string }> = {
  free: { storage: 200 * 1024 * 1024, daily: 10, label: "Free" },
  plus: { storage: 100 * 1024 * 1024 * 1024, daily: 1000, label: "Plus" },
  enterprise: { storage: 200 * 1024 * 1024 * 1024, daily: Infinity, label: "Enterprise" },
};

const CHECKOUT_URLS: Record<string, string> = {
  Plus: "https://photo2url.lemonsqueezy.com/checkout/buy/a29b1d30-70b5-4a72-a467-99f2cc42cbdb",
  Enterprise: "https://photo2url.lemonsqueezy.com/checkout/buy/adfbbc5a-e7ff-4f48-a9c3-718e0ebbc7bb",
};

function buildCheckoutUrl(planName: string, userId: string, user?: { email?: string; name?: string }): string | null {
  const base = CHECKOUT_URLS[planName];
  if (!base) return null;

  const params = new URLSearchParams();
  params.set("lang", "en");
  params.set("checkout[custom][user_id]", userId);

  if (user?.email) params.set("checkout[email]", user.email);
  if (user?.name) params.set("checkout[name]", user.name);

  if (typeof navigator !== "undefined") {
    const parts = navigator.language.split("-");
    if (parts.length === 2) {
      params.set("checkout[billing_address][country]", parts[1].toUpperCase());
    }
  }

  params.set(
    "checkout[success_url]",
    `${window.location.origin}/dashboard?checkout=success`
  );

  return `${base}?${params.toString()}`;
}

const BILLING_PLANS = [
  {
    name: "Enterprise",
    price: "$94.90/yr",
    icon: Crown,
    highlight: true,
    features: ["256 MB per file", "Unlimited uploads", "200 GB storage", "Never expires"],
  },
  {
    name: "Plus",
    price: "$9.90/mo",
    icon: Zap,
    highlight: false,
    features: ["50 MB per file", "1,000 uploads/day", "100 GB storage", "Never expires"],
  },
];

// =============== Helpers ===============

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatLimit(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${bytes / (1024 * 1024 * 1024)} GB`;
  return `${bytes / (1024 * 1024)} MB`;
}

// =============== Main Component ===============

export default function DashboardClient({
  userId,
  data,
  dict,
}: {
  userId: string;
  data: DashboardData | null;
  dict: Dictionary;
}) {
  const { user } = useUser();
  const [tab, setTab] = useState<Tab>("overview");
  const d = dict.dashboard;
  const dt = d.tabs;

  const plan = PLAN_LIMITS[data?.planType || "free"] || PLAN_LIMITS.free;
  const storagePct = plan.storage > 0 ? ((data?.storageUsed || 0) / plan.storage) * 100 : 0;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: dt.overview, icon: LayoutDashboard },
    { id: "profile", label: dt.profile, icon: User },
    { id: "billing", label: dt.billing, icon: CreditCard },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-56 border-r bg-muted/10 shrink-0 hidden md:block">
        <nav className="p-4 space-y-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 w-56 p-4 border-t">
          <p className="text-sm font-medium truncate">
            {user?.firstName || user?.username || "User"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.primaryEmailAddress?.emailAddress || ""}
          </p>
        </div>
      </aside>

      {/* Mobile tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-40">
        <div className="flex">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium
                ${tab === t.id ? "text-primary" : "text-muted-foreground"}`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-6 pb-20 md:pb-6 overflow-auto">
        {tab === "overview" && (
          <OverviewTab data={data} plan={plan} storagePct={storagePct} dict={dict} />
        )}
        {tab === "profile" && <ProfileTab dict={dict} />}
        {tab === "billing" && (
          <BillingTab data={data} plan={plan} storagePct={storagePct} userId={userId} dict={dict} />
        )}
      </main>
    </div>
  );
}

// =============== Overview Tab ===============

function OverviewTab({
  data,
  plan,
  storagePct,
  dict,
}: {
  data: DashboardData | null;
  plan: { storage: number; daily: number; label: string };
  storagePct: number;
  dict: Dictionary;
}) {
  const d = dict.dashboard.overview;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{d.heading}</h1>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-full bg-primary/10 p-2.5">
              <HardDrive className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{d.storage}</p>
              <p className="text-xl font-bold">{formatBytes(data?.storageUsed || 0)}</p>
              <p className="text-xs text-muted-foreground">
                {plan.label} · {formatLimit(plan.storage)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-full bg-primary/10 p-2.5">
              <Image className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{d.resources}</p>
              <p className="text-xl font-bold">{data?.fileCount || 0}</p>
              <p className="text-xs text-muted-foreground">{d.resourcesDesc}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-full bg-primary/10 p-2.5">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{d.dailyUploads}</p>
              <p className="text-xl font-bold">
                {data?.uploadsToday || 0}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  / {plan.daily === Infinity ? "∞" : plan.daily}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">{d.dailyReset}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-full bg-primary/10 p-2.5">
              <Check className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{d.plan}</p>
              <p className="text-xl font-bold">{plan.label}</p>
              <p className="text-xs text-muted-foreground">{d.planActive}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storage Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">{d.storageUsage}</span>
          <span className="text-muted-foreground">
            {formatBytes(data?.storageUsed || 0)} / {formatLimit(plan.storage)} · {storagePct.toFixed(1)}%
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min(storagePct, 100)}%` }}
          />
        </div>
      </div>

      {/* File List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{d.myPhotos}</h2>
        <FileList />
      </div>
    </div>
  );
}

// =============== Profile Tab ===============

function ProfileTab({ dict }: { dict: Dictionary }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{dict.dashboard.tabs.profile}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Manage your profile information, email, password, and connected accounts.
      </p>
      <UserProfile
        routing="hash"
        appearance={{
          elements: {
            rootBox: "w-full max-w-3xl",
            card: "shadow-none border rounded-lg",
          },
        }}
      />
    </div>
  );
}

// =============== Billing Tab ===============

function BillingTab({
  data,
  plan,
  storagePct,
  userId,
  dict,
}: {
  data: DashboardData | null;
  plan: { storage: number; daily: number; label: string };
  storagePct: number;
  userId: string;
  dict: Dictionary;
}) {
  const { user } = useUser();
  const d = dict.dashboard.billing;

  const handleUpgrade = (planName: string) => {
    const url = buildCheckoutUrl(planName, userId, {
      email: user?.primaryEmailAddress?.emailAddress,
      name: user?.fullName ?? undefined,
    });
    if (url) window.location.href = url;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{d.heading}</h1>
      <p className="text-sm text-muted-foreground mb-8">{d.description}</p>

      {/* Current Plan */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-1">{d.currentPlan}</h2>
          <p className="text-sm text-muted-foreground mb-4">{d.upgradeDesc}</p>
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {plan.label}
            </span>
            <span className="text-xs text-muted-foreground">{d.active}</span>
          </div>

          {/* Feature list */}
          <ul className="space-y-2 mb-4">
            {d.features.map((feat) => (
              <li key={feat} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                {feat}
              </li>
            ))}
          </ul>

          {/* Storage usage */}
          <div className="mt-6 p-4 rounded-lg bg-muted/30">
            <p className="text-sm font-medium mb-3">{d.storageUsage}</p>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                {formatBytes(data?.storageUsed || 0)} / {formatLimit(plan.storage)}
              </span>
              <span className="text-muted-foreground">{storagePct.toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(storagePct, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Plans — only shown for free users */}
      {plan.label === "Free" && (
        <div>
          <h2 className="text-lg font-semibold mb-4">{d.upgradeTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {BILLING_PLANS.map((p) => (
              <Card key={p.name} className={p.highlight ? "border-primary ring-1 ring-primary" : ""}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <p.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-bold">{p.name}</h3>
                  </div>
                  <p className="text-2xl font-bold mb-3">{p.price}</p>
                  <ul className="space-y-1.5 mb-4">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={p.highlight ? "default" : "outline"}
                    onClick={() => handleUpgrade(p.name)}
                  >
                    {d.upgradeCta} {p.name} <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

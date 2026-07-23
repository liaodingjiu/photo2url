"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { UserProfile } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
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
  Sun,
  Moon,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import FileList, { type FileRecord } from "@/components/FileList";
import { toast } from "sonner";
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
  free: { storage: 200 * 1024 * 1024, daily: 15, label: "Free" },
  plus: { storage: 100 * 1024 * 1024 * 1024, daily: 1000, label: "Plus" },
  enterprise: { storage: 200 * 1024 * 1024 * 1024, daily: Infinity, label: "Enterprise" },
};

// Synced with utils/upload-limit.ts — the single source of truth
const PLAN_FEATURES: Record<string, string[]> = {
  free: [
    "15 uploads per day",
    "3 MB per file",
    "200 MB storage",
    "Files kept for 180 days",
  ],
  plus: [
    "1,000 uploads per day",
    "50 MB per file",
    "100 GB storage",
    "Never expires",
  ],
  enterprise: [
    "Unlimited uploads",
    "256 MB per file",
    "200 GB storage",
    "Never expires",
  ],
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
  if (bytes < (1024 * 1024 * 1024)) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatLimit(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${bytes / (1024 * 1024 * 1024)} GB`;
  return `${bytes / (1024 * 1024)} MB`;
}

function useDarkMode() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return { dark, toggle };
}

// =============== Main Component ===============

export default function DashboardClient({
  userId,
  data,
  files,
  dict,
}: {
  userId: string;
  data: DashboardData | null;
  files?: FileRecord[];
  dict: Dictionary;
}) {
  // useUser may not be available when Clerk is bypassed in local dev
  let user: { firstName?: string | null; username?: string | null;
              primaryEmailAddress?: { emailAddress: string } | null;
              fullName?: string | null } | null | undefined = null;
  try { const u = useUser(); user = u.user; } catch { /* Clerk not available */ }

  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("overview");
  const { dark, toggle: toggleDark } = useDarkMode();
  const d = dict.dashboard;
  const dt = d.tabs;

  // P0 #26: Payment success feedback
  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      toast.success("Payment successful! Your plan has been upgraded.", {
        duration: 6000,
      });
      setTab("billing");
      // Clean the URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  const plan = PLAN_LIMITS[data?.planType || "free"] || PLAN_LIMITS.free;
  const storagePct = plan.storage > 0 ? ((data?.storageUsed || 0) / plan.storage) * 100 : 0;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: dt.overview, icon: LayoutDashboard },
    { id: "profile", label: dt.profile, icon: User },
    { id: "billing", label: dt.billing, icon: CreditCard },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar — P0 #1: fixed positioning, P2 #23: active indicator, P3 #3: visibility */}
      <aside className="relative flex flex-col w-56 border-r bg-muted/30 shrink-0 hidden md:flex">
        {/* Brand logo — click to return home */}
        <a
          href="/"
          className="flex items-center gap-2 px-4 py-3.5 border-b text-sm font-semibold hover:bg-muted/50 transition-colors"
        >
          <Image className="h-5 w-5 text-primary" />
          photo2url
        </a>
        <nav className="p-4 space-y-1 flex-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors
                ${tab === t.id
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              {/* P2 #23: Active left border bar */}
              {tab === t.id && (
                <span className="ml-auto w-0.5 h-4 rounded-full bg-primary-foreground/50" />
              )}
            </button>
          ))}

          {/* P2 #25: Dark mode toggle */}
          <button
            onClick={toggleDark}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mt-2"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {dark ? "Light Mode" : "Dark Mode"}
          </button>
        </nav>

        {/* P0 #1: mt-auto pushes user info to bottom naturally */}
        <div className="p-4 border-t">
          <p className="text-sm font-medium truncate">
            {user?.firstName || user?.username || "User"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.primaryEmailAddress?.emailAddress || ""}
          </p>
        </div>
      </aside>

      {/* Mobile tab bar — P2 #20: middle tab as FAB upload */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-40 safe-area-inset-bottom">
        <div className="flex items-end">
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
          {/* P2 #20: Prominent upload FAB in center */}
          <div className="flex-1 flex flex-col items-center -mt-3">
            <a
              href="/#upload"
              className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors active:scale-95"
              aria-label="Upload photo"
            >
              <Upload className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-6 pb-24 md:pb-6 overflow-auto">
        {/* P1 #27: Data loading error banner */}
        {!data && (
          <div className="flex items-center gap-3 p-4 mb-6 rounded-lg border border-destructive/30 bg-destructive/5 text-sm">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="font-medium text-destructive">Failed to load dashboard data</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Please refresh the page or try again later.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto shrink-0"
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </div>
        )}

        {/* P3 #4: Tab content with fade-in animation */}
        <div key={tab} className="animate-in fade-in slide-in-from-right-2 duration-200">
          {tab === "overview" && (
            <OverviewTab data={data} plan={plan} storagePct={storagePct} dict={dict} user={user} files={files} />
          )}
          {tab === "profile" && <ProfileTab dict={dict} />}
          {tab === "billing" && (
            <BillingTab data={data} plan={plan} storagePct={storagePct} userId={userId} dict={dict} />
          )}
        </div>
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
  user,
  files,
}: {
  data: DashboardData | null;
  plan: { storage: number; daily: number; label: string };
  storagePct: number;
  dict: Dictionary;
  user?: { firstName?: string | null; username?: string | null } | null;
  files?: FileRecord[];
}) {
  const d = dict.dashboard.overview;

  // P3 #6: Threshold color for storage bar
  const barColor =
    storagePct > 85 ? "bg-destructive" : storagePct > 60 ? "bg-amber-500" : "bg-primary";

  return (
    <div>
      {/* P3 #9: Personalized greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {user?.firstName ? `Welcome back, ${user.firstName}` : d.heading}
        </h1>
        {user?.firstName && (
          <p className="text-sm text-muted-foreground mt-1">{d.heading}</p>
        )}
      </div>

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

      {/* Storage Bar — P3 #6: threshold colors, P3 #22: ARIA */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">{d.storageUsage}</span>
          <span className="text-muted-foreground">
            {formatBytes(data?.storageUsed || 0)} / {formatLimit(plan.storage)} · {storagePct.toFixed(1)}%
          </span>
        </div>
        <div
          className="h-2.5 rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(storagePct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Storage usage: ${storagePct.toFixed(1)}%`}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(storagePct, 100)}%` }}
          />
        </div>
        {/* P3 #6: Warning message near limit */}
        {storagePct > 85 && (
          <p className="text-xs text-destructive mt-2">
            Storage almost full. Consider upgrading your plan.
          </p>
        )}
      </div>

      {/* File List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{d.myPhotos}</h2>
          <a href="/#upload">
            <Button size="sm">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </a>
        </div>
        <FileList files={files} />
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
  let user: { primaryEmailAddress?: { emailAddress: string } | null;
              fullName?: string | null } | null | undefined = null;
  try { const u = useUser(); user = u.user; } catch { /* Clerk not available */ }
  const d = dict.dashboard.billing;

  // P3 #6: Threshold color
  const barColor =
    storagePct > 85 ? "bg-destructive" : storagePct > 60 ? "bg-amber-500" : "bg-primary";

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
            {/* Paid users: self-service subscription management via Lemon Squeezy */}
            {plan.label !== "Free" && (
              <a
                href="https://photo2url.lemonsqueezy.com/billing"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-xs text-primary hover:underline shrink-0"
              >
                Manage Subscription ↗
              </a>
            )}
          </div>

          {/* Feature list — dynamic per plan, synced with utils/upload-limit.ts */}
          <ul className="space-y-2 mb-4">
            {(PLAN_FEATURES[plan.label] || PLAN_FEATURES.free).map((feat) => (
              <li key={feat} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                {feat}
              </li>
            ))}
          </ul>

          {/* P3 #12: Separator between features and storage */}
          <Separator className="my-5" />

          {/* Storage usage — P3 #22: ARIA */}
          <div className="p-4 rounded-lg bg-muted/30">
            <p className="text-sm font-medium mb-3">{d.storageUsage}</p>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                {formatBytes(data?.storageUsed || 0)} / {formatLimit(plan.storage)}
              </span>
              <span className="text-muted-foreground">{storagePct.toFixed(1)}%</span>
            </div>
            <div
              className="h-2 rounded-full bg-muted overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(storagePct)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Storage usage: ${storagePct.toFixed(1)}%`}
            >
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${Math.min(storagePct, 100)}%` }}
              />
            </div>
            {storagePct > 85 && (
              <p className="text-xs text-destructive mt-2">
                Storage almost full. Consider upgrading your plan.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* P1 #28: Show upgrade cards for Free AND Plus users */}
      {plan.label !== "Enterprise" && (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {plan.label === "Plus" ? "Upgrade to Enterprise" : d.upgradeTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* P1 #28: Plus users only see Enterprise card */}
            {BILLING_PLANS.filter((p) => {
              if (plan.label === "Plus") return p.name === "Enterprise";
              return true;
            }).map((p) => (
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
                    {plan.label === "Plus" ? "Upgrade to " : d.upgradeCta + " "}{p.name} <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
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

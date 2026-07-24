"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  FileText,
  Shield,
  Sun,
  Moon,
  Image,
} from "lucide-react";
import { toast } from "sonner";
import type { Dictionary } from "@/lib/i18n";
import UsersTab from "./UsersTab";
import LogsTab from "./LogsTab";

type Tab = "users" | "logs";

export interface AdminUser {
  id: string;
  email: string;
  planType: string;
  storageUsed: number;
  fileCount: number;
  suspendedAt: string | null;
  createdAt: string;
}

export interface AdminUserDetail {
  user: AdminUser;
  fileCount: number;
  files: {
    id: string;
    original_name: string;
    file_size: number;
    mime_type: string;
    created_at: string;
  }[];
  logs: {
    admin_id: string;
    action: string;
    detail: string | null;
    ip_address: string;
    created_at: string;
  }[];
}

export interface AdminLog {
  admin_id: string;
  target_user_id: string;
  action: string;
  detail: string | null;
  ip_address: string;
  created_at: string;
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

export default function AdminClient({
  userId,
  userName,
  dict,
}: {
  userId: string;
  userName: string;
  dict: Dictionary;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("users");
  const { dark, toggle: toggleDark } = useDarkMode();

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "users", label: "Users", icon: Users },
    { id: "logs", label: "Logs", icon: FileText },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="relative flex flex-col w-56 border-r bg-muted/30 shrink-0 hidden md:flex">
        <a
          href="/"
          className="flex items-center gap-2 px-4 py-3.5 border-b text-sm font-semibold hover:bg-muted/50 transition-colors"
        >
          <img src="/logo.png" alt="photo2url" className="h-5 w-5" />
          photo2url
        </a>
        <div className="px-4 py-3 border-b text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 inline mr-1.5 text-primary" />
          Admin Panel
        </div>
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
            </button>
          ))}
          <button
            onClick={toggleDark}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mt-2"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {dark ? "Light Mode" : "Dark Mode"}
          </button>
        </nav>
        <div className="p-4 border-t">
          <p className="text-sm font-medium truncate">{userName}</p>
          <p className="text-xs text-muted-foreground">Admin</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 border-b bg-background z-40 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-1.5 text-sm font-semibold">
            <img src="/logo.png" alt="photo2url" className="h-5 w-5" />
            photo2url
          </a>
          <span className="text-xs text-muted-foreground">
            <Shield className="h-3 w-3 inline mr-0.5 text-primary" />
            Admin
          </span>
        </div>
        <div className="flex items-center gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
                }`}
            >
              {t.label}
            </button>
          ))}
          <button onClick={toggleDark} className="p-1.5 rounded-lg hover:bg-muted">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-6 mt-12 md:mt-0 overflow-auto">
        {tab === "users" && <UsersTab dict={dict} />}
        {tab === "logs" && <LogsTab dict={dict} />}
      </main>
    </div>
  );
}

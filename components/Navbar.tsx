"use client";

import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Wrench } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

export default function Navbar({ dict }: { dict?: Dictionary }) {
  let isSignedIn = false;
  try { const auth = useAuth(); isSignedIn = auth.isSignedIn ?? false; } catch { /* Clerk not available */ }
  const n = dict?.nav;

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <img
            src="/logo.png"
            srcSet="/logo@2x.png 2x"
            alt="photo2url"
            className="h-6 w-6 rounded"
          />
          <span className="hidden sm:inline">photo2url</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          <Link href="/" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm">
              {n?.home ?? "Home"}
            </Button>
          </Link>

          {/* Tools Dropdown — hidden on mobile (all coming soon) */}
          <div className="hidden sm:inline-flex">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="sm" className="gap-1">
                <Wrench className="h-4 w-4" />
                {n?.tools ?? "Tools"}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem disabled>
                Image Compressor — Coming Soon
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                Format Converter — Coming Soon
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                Image Watermark — Coming Soon
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>

          <Link href="/#pricing">
            <Button variant="ghost" size="sm">
              {n?.pricing ?? "Pricing"}
            </Button>
          </Link>

          {/* Auth */}
          {isSignedIn ? (
            <div className="ml-2 flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  {n?.dashboard ?? "Dashboard"}
                </Button>
              </Link>
              <UserButton />
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">{n?.login ?? "Login"}</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">{n?.signup ?? "Sign Up"}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

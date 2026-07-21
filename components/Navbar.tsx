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
import { Image, ChevronDown, Wrench } from "lucide-react";

export default function Navbar() {
  const { isSignedIn } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Image className="h-6 w-6" />
          <span>photo2url</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {/* Tools Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="sm" className="gap-1">
                <Wrench className="h-4 w-4" />
                Tools
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

          <Link href="/#pricing">
            <Button variant="ghost" size="sm">
              Pricing
            </Button>
          </Link>

          {/* Auth */}
          {isSignedIn ? (
            <div className="ml-2 flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
              <UserButton />
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

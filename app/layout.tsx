import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import ClerkListener from "@/components/ClerkListener";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "photo2url — Instant Photo To URL",
  description:
    "No sign-up required. Upload → Get Link → Embed anywhere. Fast, free image hosting for Notion, Reddit, GitHub, and more.",
  keywords: [
    "image hosting",
    "image to url",
    "free image upload",
    "photo to url",
    "instant image link",
    "markdown image",
  ],
  openGraph: {
    title: "photo2url — Instant Photo To URL",
    description: "No sign-up required. Upload → Get Link → Embed anywhere.",
    url: "https://photo2url.com",
    siteName: "photo2url",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <ClerkListener />
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
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
  title: "photo2url — Free Image to URL Converter",
  description:
    "Upload images and get instant URLs for embedding in Notion, Reddit, GitHub, Jira, and more. Free, fast, no sign-up required.",
  keywords: [
    "image hosting",
    "image to url",
    "free image upload",
    "image hosting for notion",
    "markdown image",
  ],
  openGraph: {
    title: "photo2url — Free Image to URL Converter",
    description: "Upload images, get URLs instantly. Free forever plan.",
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
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}

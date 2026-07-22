import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { headers } from "next/headers";
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
  title: "photo2url — Free Photo To URL",
  description:
    "No sign-up required. Upload → Get Link → Embed anywhere. Fast, free image hosting.",
  keywords: [
    "image hosting",
    "image to url",
    "free image upload",
    "photo to url",
    "instant image link",
    "markdown image",
  ],
  openGraph: {
    title: "photo2url — Free Photo To URL",
    description: "No sign-up required. Upload → Get Link → Embed anywhere.",
    url: "https://photo2url.com",
    siteName: "photo2url",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read locale from middleware-set header for dynamic html lang
  let lang = "en";
  try {
    const headersList = await headers();
    lang = headersList.get("x-locale") || "en";
  } catch {
    // headers() may not be available in all contexts
  }

  return (
    <ClerkProvider
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <html
        lang={lang}
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

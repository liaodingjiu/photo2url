import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["en", "zh-CN"];

const BYPASS_AUTH = process.env.DEV_BYPASS_AUTH === "true";

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get("locale")?.value;
  if (cookie && LOCALES.includes(cookie)) return cookie;

  const acceptLang = request.headers.get("accept-language") || "";
  const preferred = acceptLang
    .split(",")
    .map((e) => {
      const [tag, q = "1"] = e.trim().split(";q=");
      return { tag: tag.trim(), q: parseFloat(q) };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of preferred) {
    const primary = tag.split("-")[0];
    const match = LOCALES.find((l) => l === tag || l.startsWith(primary));
    if (match) return match;
  }

  return "en";
}

function handleLocaleRouting(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /en or /en/* → 301 to root (English lives at /)
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const newPath = pathname === "/en" ? "/" : pathname.slice(3);
    return NextResponse.redirect(new URL(newPath, req.url), 301);
  }

  // Already in a non-English locale route → pass through
  const currentLocale = LOCALES.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (currentLocale) {
    const res = NextResponse.next();
    res.headers.set("x-locale", currentLocale);
    return res;
  }

  // Skip API, static, sign-in/up, dashboard, admin, image routes (no locale)
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/i/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Root → English (pass through, no redirect)
  if (pathname === "/") {
    const res = NextResponse.next();
    res.headers.set("x-locale", "en");
    return res;
  }

  // Other path → redirect to detected locale
  const locale = detectLocale(req);
  const newPath = `/${locale}${pathname}`;
  return NextResponse.redirect(new URL(newPath, req.url));
}

// Local dev: skip Clerk entirely, use plain middleware
const middleware = BYPASS_AUTH
  ? (req: NextRequest) => handleLocaleRouting(req)
  : clerkMiddleware(async (auth, req) => {
      const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
      return handleLocaleRouting(req);
    });

export default middleware;

export const config = {
  matcher: [
    "/((?!_next|api/webhook|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

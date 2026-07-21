import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages deployment via @cloudflare/next-on-pages
  // output: undefined — next-on-pages uses its own build output

  // Allow images from R2 CDN
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.photo2url.com",
      },
    ],
  },

  // Edge runtime for API routes
  experimental: {
    // Keep minimal experimental flags for CF compat
  },
};

export default nextConfig;

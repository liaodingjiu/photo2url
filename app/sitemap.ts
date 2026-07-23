import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE_URL = "https://photo2url.com";

  // English pages (default locale, root path)
  const en = [
    { path: "", priority: 1.0 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
    { path: "/refund", priority: 0.3 },
  ];

  // zh-CN pages
  const zh = [
    { path: "/zh-CN", priority: 1.0 },
    { path: "/zh-CN/privacy", priority: 0.3 },
    { path: "/zh-CN/terms", priority: 0.3 },
    { path: "/zh-CN/refund", priority: 0.3 },
  ];

  const today = new Date().toISOString();

  return [...en, ...zh].map(({ path, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: today,
    changeFrequency: path === "" || path === "/zh-CN"
      ? ("weekly" as const)
      : ("monthly" as const),
    priority,
  }));
}

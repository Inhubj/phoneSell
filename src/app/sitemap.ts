import type { MetadataRoute } from "next";
import { SEO_PAGES } from "@/lib/seo-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_URL || "http://localhost:3000";
  const staticPaths = [
    "",
    "/sell",
    "/how-it-works",
    "/why-us",
    "/faq",
    "/contact",
    "/about",
    "/track",
    "/privacy",
    "/terms",
    "/cancellation",
  ];
  return [
    ...staticPaths.map((path) => ({
      url: `${base}${path || "/"}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...SEO_PAGES.map((page) => ({
      url: `${base}/${page.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}

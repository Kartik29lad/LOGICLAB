import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/search",
        "/progress",
        "/history",
        "/favorites",
        "/bookmarks",
        "/activity",
        "/settings",
        "/experiments",
        "/learning",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}

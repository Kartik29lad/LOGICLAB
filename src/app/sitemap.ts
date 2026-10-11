import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { getDiscoveryContent } from "@/content/discovery";

const base = siteConfig.url.replace(/\/$/, "");
const url = (path: string) => `${base}${path}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: url("/algorithms"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: url("/data-structures"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: url("/challenges"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: url("/learning-paths"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];
  for (const item of getDiscoveryContent("ALGORITHM")) {
    if (item.metadata.isActive) {
      entries.push({
        url: url(`/algorithms/${item.metadata.slug}`),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      });
      if (item.metadata.visualizationType)
        entries.push({
          url: url(`/visualizer/${item.metadata.slug}`),
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.7,
        });
    }
  }
  for (const item of getDiscoveryContent("DATA_STRUCTURE")) {
    if (item.metadata.isActive)
      entries.push({
        url: url(`/data-structures/${item.metadata.slug}`),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      });
  }
  for (const slug of ["foundations", "sorting-mastery", "graph-algorithms"])
    entries.push({
      url: url(`/learning-paths/${slug}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  return entries;
}

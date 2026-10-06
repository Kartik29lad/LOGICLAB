export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  phase: string;
}

export const siteConfig: SiteConfig = {
  name: "LogicLab",
  tagline: "Explore. Visualize. Understand.",
  description: "Interactive algorithm and data-structure learning laboratory.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  phase: "Phase 1 — Repository and Development Foundation",
};

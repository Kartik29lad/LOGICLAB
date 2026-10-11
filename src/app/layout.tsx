import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/seo";
import { AppShell } from "@/components/layout/app-shell";

import "@/styles/globals.css";
import "@/styles/visualizer.css";
import "@/styles/dfs-laboratory.css";
import "@/components/ui/ui.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "LogicLab — Explore. Visualize. Understand.", template: "%s | LogicLab" },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: "LogicLab — Explore. Visualize. Understand.",
    description: siteConfig.description,
    url: absoluteUrl("/"),
    siteName: siteConfig.name,
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export function absoluteUrl(pathname = "/"): string {
  const base = siteConfig.url.replace(/\/$/, "");
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

export function canonicalMetadata(
  pathname: string,
  options?: {
    title?: string;
    description?: string;
    noIndex?: boolean;
  }
): Metadata {
  const canonical = absoluteUrl(pathname);
  return {
    title: options?.title,
    description: options?.description,
    alternates: { canonical },
    ...(options?.noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: options?.title ?? siteConfig.name,
      description: options?.description ?? siteConfig.description,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: options?.title ?? siteConfig.name,
      description: options?.description ?? siteConfig.description,
    },
  };
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

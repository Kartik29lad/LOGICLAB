import { describe, expect, it } from "vitest";

import { absoluteUrl, canonicalMetadata, safeJsonLd } from "@/lib/seo";

describe("Phase 22 SEO contracts", () => {
  it("builds absolute canonical URLs from site configuration", () => {
    expect(absoluteUrl("/algorithms/bubble-sort")).toContain("/algorithms/bubble-sort");
  });

  it("canonicalizes stable public pages and strips query-state from the canonical", () => {
    const metadata = canonicalMetadata("/algorithms");
    expect(metadata.alternates?.canonical).toBe(absoluteUrl("/algorithms"));
  });

  it("marks private/search pages noindex", () => {
    const metadata = canonicalMetadata("/search", { noIndex: true });
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it("escapes JSON-LD opening angle brackets to prevent script-breakout payloads", () => {
    expect(safeJsonLd({ value: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
});

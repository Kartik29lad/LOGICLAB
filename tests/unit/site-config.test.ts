import { describe, expect, it } from "vitest";

import { siteConfig } from "@/config/site";

describe("siteConfig", () => {
  it("should have correct project identity", () => {
    expect(siteConfig.name).toBe("LogicLab");
    expect(siteConfig.tagline).toBe("Explore. Visualize. Understand.");
  });

  it("should declare Phase 1 status", () => {
    expect(siteConfig.phase).toContain("Phase 1");
  });

  it("should provide a valid fallback URL", () => {
    expect(siteConfig.url).toMatch(/^https?:\/\//);
  });
});

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string): string =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

describe("Phase 24 — release regression invariants", () => {
  it("keeps public discovery routes present", () => {
    for (const route of [
      "src/app/page.tsx",
      "src/app/(public)/algorithms/page.tsx",
      "src/app/(public)/data-structures/page.tsx",
      "src/app/(public)/challenges/page.tsx",
      "src/app/(public)/learning-paths/page.tsx",
    ])
      expect(fs.existsSync(path.resolve(process.cwd(), route))).toBe(true);
  });

  it("keeps SEO controls and private workspace noindex boundary", () => {
    expect(read("src/app/robots.ts")).toContain("sitemap");
    expect(read("src/app/sitemap.ts")).toContain("algorithms");
    expect(read("src/app/(workspace)/layout.tsx")).toContain("index: false");
  });

  it("keeps the security middleware boundary in place", () => {
    const middleware = read("src/middleware.ts");
    expect(middleware).toContain("NEXT_PUBLIC_CANONICAL_HOST");
    expect(middleware).toContain("https:");
  });

  it("does not reintroduce unbounded request.json calls in API routes", () => {
    const apiRoot = path.resolve(process.cwd(), "src/app/api");
    const stack = [apiRoot];
    while (stack.length) {
      const current = stack.pop()!;
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) stack.push(full);
        if (entry.isFile() && entry.name.endsWith(".ts")) {
          expect(fs.readFileSync(full, "utf8"), full).not.toMatch(/request\.json\(\)/);
        }
      }
    }
  });

  it("keeps the required test matrix domains represented", () => {
    const matrix = JSON.parse(read("tests/test-matrix.json")) as {
      criticalDomains: string[];
    };
    expect(matrix.criticalDomains.length).toBeGreaterThanOrEqual(11);
  });
});

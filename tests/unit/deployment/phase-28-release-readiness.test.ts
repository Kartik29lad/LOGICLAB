import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("Phase 28 release readiness", () => {
  it("contains the release control documents and workflows", () => {
    const files = [
      "docs/deployment/phase-28-production-readiness-and-release.md",
      "docs/release/RELEASE-CHECKLIST.md",
      "docs/release/RELEASE-NOTES-TEMPLATE.md",
      ".github/workflows/deploy-production.yml",
    ];
    expect(files.every((file) => existsSync(resolve(root, file)))).toBe(true);
  });

  it("uses protected production approval before deployment", () => {
    const workflow = readFileSync(resolve(root, ".github/workflows/deploy-production.yml"), "utf8");
    expect(workflow).toContain("production-approval");
    expect(workflow).toContain("production");
  });

  it("defines an explicit release manifest command", () => {
    const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(packageJson.scripts?.["release:manifest"]).toBeDefined();
    expect(packageJson.scripts?.["release:readiness"]).toBeDefined();
    expect(packageJson.scripts?.["production:smoke"]).toBeDefined();
  });
});

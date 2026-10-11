import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function file(path: string): string {
  return readFileSync(resolve(root, path), "utf8");
}

describe("Phase 27 production infrastructure", () => {
  it("uses Next.js standalone output", () => {
    expect(file("next.config.ts")).toContain('output: "standalone"');
  });

  it("uses a non-root container runtime", () => {
    const dockerfile = file("Dockerfile");
    expect(dockerfile).toContain("USER nextjs");
    expect(dockerfile).toContain("groupadd --system");
  });

  it("requires an immutable production image reference", () => {
    const compose = file("docker-compose.production.yml");
    expect(compose).toContain("LOGICLAB_IMAGE:?Set LOGICLAB_IMAGE");
    expect(compose).toContain("read_only: true");
    expect(compose).toContain("no-new-privileges:true");
  });

  it("keeps production deployment files present", () => {
    expect(existsSync(resolve(root, ".github/workflows/deploy-staging.yml"))).toBe(true);
    expect(existsSync(resolve(root, ".github/workflows/deploy-production.yml"))).toBe(true);
    expect(existsSync(resolve(root, "scripts/deployment/verify-runtime-config.ts"))).toBe(true);
  });
});

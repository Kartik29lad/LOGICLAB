import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Phase 17 learning architecture", () => {
  const root = path.resolve(process.cwd());
  it("contains learning-path content and persistence migrations", () => {
    expect(
      fs.existsSync(path.join(root, "src/content/learning-paths/foundations/content.ts"))
    ).toBe(true);
    expect(fs.existsSync(path.join(root, "database/migrations/009_learning_paths.sql"))).toBe(true);
    expect(fs.existsSync(path.join(root, "database/migrations/008_achievements.sql"))).toBe(true);
  });
  it("contains server-side learning endpoints", () => {
    expect(fs.existsSync(path.join(root, "src/app/api/learning-paths/route.ts"))).toBe(true);
    expect(fs.existsSync(path.join(root, "src/app/api/achievements/route.ts"))).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import { getLearningPath, LEARNING_PATHS } from "@/core/learning/learning-path-catalog";

describe("learning path catalog", () => {
  it("contains ordered paths with non-empty item sequences", () => {
    expect(LEARNING_PATHS.length).toBeGreaterThanOrEqual(3);
    expect(LEARNING_PATHS.every((path) => path.itemSlugs.length > 0)).toBe(true);
  });
  it("resolves paths by stable slug", () => {
    expect(getLearningPath("sorting-mastery")?.itemSlugs).toContain("quick-sort");
  });
});

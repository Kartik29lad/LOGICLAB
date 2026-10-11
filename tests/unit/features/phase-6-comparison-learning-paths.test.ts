import { describe, expect, it } from "vitest";

import { getLearningPath, LEARNING_PATHS } from "@/core/learning/learning-path-catalog";
import { runComparison } from "@/server/services/experiments/execution-service";
import { getDiscoveryItem } from "@/content/discovery";

describe("Phase 6 — Comparison, Playground, and Learning Paths", () => {
  describe("Learning Paths Catalog & Content Resolution", () => {
    it("contains all foundational learning paths", () => {
      const slugs = LEARNING_PATHS.map((p) => p.slug);
      expect(slugs).toContain("foundations");
      expect(slugs).toContain("sorting-mastery");
      expect(slugs).toContain("graph-algorithms");
    });

    it("resolves both algorithms and data structures across learning path items", () => {
      const foundations = getLearningPath("foundations");
      expect(foundations).toBeDefined();

      // Check that all item slugs resolve to a discovery content package
      const resolvedItems = foundations!.itemSlugs.map((slug) => getDiscoveryItem(slug));
      expect(resolvedItems.every(Boolean)).toBe(true);

      // Verify foundations contains both a data structure ('array') and an algorithm ('bubble-sort')
      const arrayItem = getDiscoveryItem("array");
      expect(arrayItem?.metadata.type).toBe("DATA_STRUCTURE");

      const bubbleItem = getDiscoveryItem("bubble-sort");
      expect(bubbleItem?.metadata.type).toBe("ALGORITHM");
    });

    it("maintains sorting-mastery path sequence", () => {
      const sorting = getLearningPath("sorting-mastery");
      expect(sorting).toBeDefined();
      expect(sorting!.itemSlugs).toEqual([
        "bubble-sort",
        "insertion-sort",
        "selection-sort",
        "merge-sort",
        "quick-sort",
        "heap-sort",
      ]);
      expect(sorting!.itemSlugs.every((slug) => Boolean(getDiscoveryItem(slug)))).toBe(true);
    });

    it("validates prerequisite relationships where present", () => {
      const graph = getLearningPath("graph-algorithms");
      expect(graph).toBeDefined();
      expect(graph!.prerequisitePathSlugs).toContain("foundations");
    });
  });

  describe("Algorithm Comparison Engine Integration", () => {
    it("executes comparison on multiple sorting algorithms with valid array", () => {
      const dataset = [10, 3, 8, 2, 7, 1];
      const results = runComparison(["bubble-sort", "merge-sort", "quick-sort"], dataset);

      expect(results).toHaveLength(3);
      for (const res of results) {
        expect(res.name).toBeDefined();
        expect(res.complexity.average).toBeDefined();
        expect(res.complexity.space).toBeDefined();
        expect(res.metrics.steps).toBeGreaterThan(0);
        const sortRes = res.result as { sorted?: number[] };
        expect(sortRes.sorted).toEqual([1, 2, 3, 7, 8, 10]);
      }
    });

    it("tracks operation metrics (comparisons and swaps/inversions)", () => {
      const results = runComparison(["bubble-sort", "insertion-sort"], [5, 4, 3, 2, 1]);
      const bubble = results.find((r) => r.slug === "bubble-sort");
      const insertion = results.find((r) => r.slug === "insertion-sort");

      expect(bubble).toBeDefined();
      expect(bubble!.metrics.comparisons).toBeGreaterThan(0);
      expect(bubble!.metrics.swaps).toBeGreaterThan(0);

      expect(insertion).toBeDefined();
      expect(insertion!.metrics.comparisons).toBeGreaterThan(0);
    });

    it("rejects invalid algorithm selection bounds", () => {
      expect(() => runComparison(["bubble-sort"], [1, 2, 3])).toThrow(
        "Select between 2 and 6 algorithms."
      );
      expect(() =>
        runComparison(
          [
            "bubble-sort",
            "insertion-sort",
            "selection-sort",
            "merge-sort",
            "quick-sort",
            "heap-sort",
            "extra-sort",
          ],
          [1, 2, 3]
        )
      ).toThrow("Select between 2 and 6 algorithms.");
    });

    it("rejects invalid input datasets", () => {
      expect(() => runComparison(["bubble-sort", "merge-sort"], [])).toThrow();
      expect(() => runComparison(["bubble-sort", "merge-sort"], ["a", "b"])).toThrow();
      expect(() => runComparison(["bubble-sort", "merge-sort"], "not an array")).toThrow();
    });
  });
});

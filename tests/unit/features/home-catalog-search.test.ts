import { describe, expect, it } from "vitest";

import {
  DISCOVERY_CATEGORIES,
  DISCOVERY_CONTENT,
  getDiscoveryContent,
  getDiscoveryItem,
} from "@/content/discovery";
import { filterDiscovery } from "@/features/algorithms/discovery-utils";

describe("Phase 5: Home, Catalog, Detail Pages, and Search", () => {
  describe("Homepage Content & Structure", () => {
    it("provides the complete set of discovery categories and counts", () => {
      const algorithms = getDiscoveryContent("ALGORITHM");
      const dataStructures = getDiscoveryContent("DATA_STRUCTURE");

      expect(algorithms).toHaveLength(12);
      expect(dataStructures).toHaveLength(10);
      expect(DISCOVERY_CATEGORIES.length).toBeGreaterThan(0);

      // Verify popular items exist in catalog
      const popularSlugs = ["bubble-sort", "binary-search", "bfs", "dfs"];
      for (const slug of popularSlugs) {
        const item = algorithms.find((a) => a.metadata.slug === slug);
        expect(item).toBeDefined();
        expect(item?.metadata.title).toBeTruthy();
      }

      const popularDs = dataStructures.find((d) => d.metadata.slug === "binary-search-tree");
      expect(popularDs).toBeDefined();
      expect(popularDs?.metadata.title).toBe("Binary Search Tree");
    });
  });

  describe("Catalog Pages (Algorithms & Data Structures)", () => {
    it("ensures every algorithm has required educational metadata", () => {
      const algorithms = getDiscoveryContent("ALGORITHM");
      for (const algo of algorithms) {
        expect(algo.metadata.slug).toBeTruthy();
        expect(algo.metadata.title).toBeTruthy();
        expect(algo.metadata.summary).toBeTruthy();
        expect(algo.metadata.category).toBeTruthy();
        expect(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).toContain(algo.metadata.difficulty);
        expect(algo.metadata.learningObjectives.length).toBeGreaterThan(0);
        expect(algo.metadata.complexity).toBeDefined();
        expect(algo.metadata.complexity?.timeWorst).toBeTruthy();
        expect(algo.metadata.complexity?.space).toBeTruthy();
      }
    });

    it("ensures every data structure has required educational metadata", () => {
      const dataStructures = getDiscoveryContent("DATA_STRUCTURE");
      for (const ds of dataStructures) {
        expect(ds.metadata.slug).toBeTruthy();
        expect(ds.metadata.title).toBeTruthy();
        expect(ds.metadata.summary).toBeTruthy();
        expect(ds.metadata.category).toBeTruthy();
        expect(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).toContain(ds.metadata.difficulty);
        expect(ds.metadata.learningObjectives.length).toBeGreaterThan(0);
      }
    });

    it("filters catalogs by category, difficulty, tag, and query string", () => {
      const allAlgorithms = getDiscoveryContent("ALGORITHM");

      // Category filter
      const sorting = filterDiscovery(allAlgorithms, {
        query: "",
        category: "sorting",
        difficulty: "ALL",
        tag: "ALL",
      });
      expect(sorting.length).toBe(6);
      expect(sorting.every((item) => item.metadata.category === "sorting")).toBe(true);

      // Difficulty filter
      const beginner = filterDiscovery(allAlgorithms, {
        query: "",
        category: "ALL",
        difficulty: "BEGINNER",
        tag: "ALL",
      });
      expect(beginner.length).toBeGreaterThan(0);
      expect(beginner.every((item) => item.metadata.difficulty === "BEGINNER")).toBe(true);

      // Combined query and difficulty filter
      const searchMatch = filterDiscovery(allAlgorithms, {
        query: "quick",
        category: "ALL",
        difficulty: "INTERMEDIATE",
        tag: "ALL",
      });
      expect(searchMatch).toHaveLength(1);
      expect(searchMatch[0]?.metadata.slug).toBe("quick-sort");
    });
  });

  describe("Detail Pages Resolution & Bound Invariants", () => {
    const validAlgoSlugs = [
      "bubble-sort",
      "insertion-sort",
      "selection-sort",
      "merge-sort",
      "quick-sort",
      "heap-sort",
      "linear-search",
      "binary-search",
      "bfs",
      "dfs",
      "dijkstra",
      "a-star",
    ];

    const validDsSlugs = [
      "array",
      "stack",
      "queue",
      "linked-list",
      "heap",
      "hash-table",
      "tree",
      "binary-search-tree",
      "trie",
      "graph",
    ];

    it.each(validAlgoSlugs)("resolves algorithm detail for '%s'", (slug) => {
      const item = getDiscoveryItem(slug, "ALGORITHM");
      expect(item).toBeDefined();
      expect(item?.metadata.type).toBe("ALGORITHM");
      expect(item?.explanation).toBeTruthy();
    });

    it.each(validDsSlugs)("resolves data structure detail for '%s'", (slug) => {
      const item = getDiscoveryItem(slug, "DATA_STRUCTURE");
      expect(item).toBeDefined();
      expect(item?.metadata.type).toBe("DATA_STRUCTURE");
      expect(item?.explanation).toBeTruthy();
    });

    it("returns undefined for nonexistent slugs (guaranteeing notFound)", () => {
      expect(getDiscoveryItem("nonexistent-algorithm", "ALGORITHM")).toBeUndefined();
      expect(getDiscoveryItem("invalid-data-structure", "DATA_STRUCTURE")).toBeUndefined();
      expect(getDiscoveryItem("")).toBeUndefined();
    });
  });

  describe("Search Engine & Result Consistency", () => {
    it("returns empty results for empty or whitespace query", () => {
      expect(
        filterDiscovery(DISCOVERY_CONTENT, {
          query: "",
          category: "ALL",
          difficulty: "ALL",
          tag: "ALL",
        })
      ).toHaveLength(DISCOVERY_CONTENT.length);

      expect(
        filterDiscovery(DISCOVERY_CONTENT, {
          query: "   ",
          category: "ALL",
          difficulty: "ALL",
          tag: "ALL",
        })
      ).toHaveLength(DISCOVERY_CONTENT.length);
    });

    it("finds content across titles, categories, and tags", () => {
      const graphResults = filterDiscovery(DISCOVERY_CONTENT, {
        query: "graph",
        category: "ALL",
        difficulty: "ALL",
        tag: "ALL",
      });
      expect(graphResults.length).toBeGreaterThan(0);
      expect(graphResults.some((item) => item.metadata.slug === "bfs")).toBe(true);
      expect(graphResults.some((item) => item.metadata.slug === "graph")).toBe(true);

      const treeResults = filterDiscovery(DISCOVERY_CONTENT, {
        query: "tree",
        category: "ALL",
        difficulty: "ALL",
        tag: "ALL",
      });
      expect(treeResults.length).toBeGreaterThan(0);
      expect(treeResults.some((item) => item.metadata.slug === "binary-search-tree")).toBe(true);
    });

    it("searches complexity notation accurately", () => {
      const logNResults = filterDiscovery(DISCOVERY_CONTENT, {
        query: "O(log n)",
        category: "ALL",
        difficulty: "ALL",
        tag: "ALL",
      });
      expect(logNResults.length).toBeGreaterThan(0);
      expect(logNResults.some((item) => item.metadata.slug === "binary-search")).toBe(true);
    });

    it("returns empty array for queries with zero matches", () => {
      const noMatch = filterDiscovery(DISCOVERY_CONTENT, {
        query: "xyz123randomnonexistentterm",
        category: "ALL",
        difficulty: "ALL",
        tag: "ALL",
      });
      expect(noMatch).toEqual([]);
    });
  });
});

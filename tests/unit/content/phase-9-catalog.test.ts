import { describe, expect, it } from "vitest";

import { loadRepositoryContent } from "../../../src/content/loaders/load-content";
import { buildContentRegistry } from "../../../src/content/registry/content-registry";
import { DEFAULT_CONTENT_REFERENCES } from "../../../src/content/registry/default-reference-provider";
import { validateRegistry } from "../../../src/content/registry/validate-registry";
import type { ContentPackage } from "../../../src/content/schema/content-types";

const algorithms = [
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
const dataStructures = [
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

describe("Phase 9 initial catalog", () => {
  it("contains every approved initial algorithm and data structure", async () => {
    const content = await loadRepositoryContent();
    const slugs = new Set(content.map((item: ContentPackage) => item.metadata.slug));
    expect(algorithms.every((slug) => slugs.has(slug))).toBe(true);
    expect(dataStructures.every((slug) => slugs.has(slug))).toBe(true);
    expect(
      content.filter((item: ContentPackage) => item.metadata.type === "ALGORITHM")
    ).toHaveLength(12);
    expect(
      content.filter((item: ContentPackage) => item.metadata.type === "DATA_STRUCTURE")
    ).toHaveLength(10);
  });

  it("passes schema and relationship validation", async () => {
    const content = await loadRepositoryContent();
    const result = validateRegistry(content, DEFAULT_CONTENT_REFERENCES);
    expect(result.issues).toEqual([]);
  });

  it("builds a populated content registry", async () => {
    const content = await loadRepositoryContent();
    const registry = buildContentRegistry(content);
    expect(registry.list("ALGORITHM")).toHaveLength(12);
    expect(registry.list("DATA_STRUCTURE")).toHaveLength(10);
    expect(registry.hasAlgorithm("bubble-sort")).toBe(true);
    expect(registry.hasDataStructure("binary-search-tree")).toBe(true);
  });

  it("maps every executable catalog item to a known core registry entry", async () => {
    const content = await loadRepositoryContent();
    for (const item of content.filter((entry: ContentPackage) =>
      ["ALGORITHM", "DATA_STRUCTURE"].includes(entry.metadata.type)
    )) {
      expect(item.metadata.implementationSlug).toBeTruthy();
      if (item.metadata.type === "ALGORITHM")
        expect(DEFAULT_CONTENT_REFERENCES.hasAlgorithm(item.metadata.implementationSlug!)).toBe(
          true
        );
      if (item.metadata.type === "DATA_STRUCTURE")
        expect(DEFAULT_CONTENT_REFERENCES.hasDataStructure(item.metadata.implementationSlug!)).toBe(
          true
        );
    }
  });

  it("gives every algorithm the minimum educational sections", async () => {
    const content = await loadRepositoryContent();
    for (const item of content.filter(
      (entry: ContentPackage) => entry.metadata.type === "ALGORITHM"
    )) {
      expect(item.metadata.mainIdea).toBeTruthy();
      expect(item.pseudocode).toBeTruthy();
      expect(item.code?.length).toBeGreaterThan(0);
      expect(item.visualization?.events.length).toBeGreaterThan(0);
      expect(item.execution?.metrics.length).toBeGreaterThan(0);
      expect(item.challenge?.answer).toBeTruthy();
    }
  });
});

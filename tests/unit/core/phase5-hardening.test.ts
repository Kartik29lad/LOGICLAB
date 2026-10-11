import { describe, expect, it } from "vitest";

import {
  MERGE_SORT_METADATA,
  mergeSort,
} from "../../../src/core/algorithms/implementations/sorting/merge-sort/merge-sort";
import { QUICK_SORT_METADATA } from "../../../src/core/algorithms/implementations/sorting/quick-sort/quick-sort";
import { DATA_STRUCTURE_METADATA, HashTable } from "../../../src/core/data-structures";
import { Graph, GRAPH_ALGORITHM_METADATA } from "../../../src/core/graph";
import { aStar } from "../../../src/core/graph/pathfinding/a-star";
import { SeededRandom } from "../../../src/core/input/random/seeded-random";

describe("Phase 5 hardening", () => {
  it("documents graph algorithm complexity and non-negative weight requirements", () => {
    expect(GRAPH_ALGORITHM_METADATA).toHaveLength(4);
    expect(
      GRAPH_ALGORITHM_METADATA.find((item) => item.id === "graph-dijkstra")?.requirements
    ).toContain("All edge weights must be non-negative.");
  });

  it("documents data structure operation complexity", () => {
    const queue = DATA_STRUCTURE_METADATA.find((item) => item.id === "queue");
    expect(queue?.operations.find((item) => item.operation === "dequeue")?.average).toBe("O(n)");
    expect(DATA_STRUCTURE_METADATA.find((item) => item.id === "binary-search-tree")?.space).toBe(
      "O(n)"
    );
  });

  it("reports merge writes with semantically correct metrics", () => {
    const result = mergeSort([3, 1, 2]);
    expect(result.sorted).toEqual([1, 2, 3]);
    expect(result.metrics.swaps).toBe(0);
    expect(result.metrics.writes).toBeGreaterThan(0);
    expect(MERGE_SORT_METADATA.complexity.space).toBe("O(n)");
  });

  it("documents Quick Sort worst-case recursion space", () => {
    expect(QUICK_SORT_METADATA.complexity.space).toContain("O(n) worst-case");
  });

  it("rejects invalid hash-table capacity and preserves undefined values in has()", () => {
    expect(() => new HashTable(0)).toThrow(RangeError);
    const table = new HashTable<string, undefined>();
    table.set("present", undefined);
    expect(table.has("present")).toBe(true);
    expect(table.get("present")).toBeUndefined();
  });

  it("rejects invalid random ranges", () => {
    const rng = new SeededRandom(1);
    expect(() => rng.nextInt(5, 4)).toThrow(RangeError);
    expect(() => rng.nextInt(Number.NaN, 4)).toThrow(RangeError);
  });

  it("rejects negative graph weights", () => {
    const graph = new Graph(true);
    expect(() => graph.addEdge("A", "B", -1)).toThrow(RangeError);
  });

  it("handles A* invalid endpoints deterministically", () => {
    const graph = new Graph(false);
    graph.addNode("A");
    expect(aStar(graph, "missing", "A")).toEqual({ path: [], cost: Infinity, visitedNodes: [] });
  });
});

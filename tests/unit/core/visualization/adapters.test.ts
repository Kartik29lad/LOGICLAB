import { describe, expect, it } from "vitest";

import { BinarySearchTree } from "../../../../src/core/data-structures/tree/binary-search-tree";
import { Graph } from "../../../../src/core/graph/models/graph";
import { toArrayVisualizationState } from "../../../../src/core/visualization/adapters/array-visualization-adapter";
import { toGraphVisualizationState } from "../../../../src/core/visualization/adapters/graph-visualization-adapter";
import { toTreeVisualizationState } from "../../../../src/core/visualization/adapters/tree-visualization-adapter";

const metrics = {
  comparisons: 0,
  swaps: 0,
  reads: 0,
  writes: 0,
  visits: 0,
  iterations: 0,
  elapsedMs: 0,
};

describe("Phase 7 visualization adapters", () => {
  it("derives deterministic array semantic state", () => {
    const state = toArrayVisualizationState(
      { values: [3, 1], activeIndexes: [1], pivotIndex: 0 },
      2,
      metrics,
      "paused"
    );
    expect(state.elements[0].state).toBe("pivot");
    expect(state.elements[1].state).toBe("comparing");
    expect(state.stepIndex).toBe(2);
  });

  it("derives graph current, visited and path state", () => {
    const graph = new Graph(true);
    graph.addNode("A");
    graph.addNode("B");
    graph.addEdge("A", "B", 4);
    const state = toGraphVisualizationState(
      {
        nodes: graph.getNodes(),
        edges: graph.getEdges(),
        directed: true,
        currentNode: "B",
        visitedNodes: ["A"],
        path: ["A", "B"],
      },
      1,
      metrics,
      "running"
    );
    expect(state.nodes.find((node) => node.id === "B")?.state).toBe("path");
    expect(state.edges[0].state).toBe("path");
  });

  it("derives tree parent-child references without mutating the tree", () => {
    const tree = new BinarySearchTree();
    tree.insert(2);
    tree.insert(1);
    tree.insert(3);
    const state = toTreeVisualizationState(tree.root, 0, metrics, "ready", [2], [1]);
    expect(state.rootId).toBeDefined();
    expect(Object.keys(state.nodes)).toHaveLength(3);
    expect(tree.inOrder()).toEqual([1, 2, 3]);
  });
});

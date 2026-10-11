import { describe, expect, it } from "vitest";

import { Graph } from "../../../../src/core/graph/models/graph";
import { toGraphVisualizationState } from "../../../../src/core/visualization/adapters/graph-visualization-adapter";

const metrics = {
  comparisons: 0,
  swaps: 0,
  reads: 0,
  writes: 0,
  visits: 2,
  iterations: 2,
  elapsedMs: 0,
};

describe("V2-16 Graph Laboratory", () => {
  it("preserves graph topology and assigns semantic node states", () => {
    const graph = new Graph(false);
    graph.addNode("A", "A", 90, 90);
    graph.addNode("B", "B", 300, 90);
    graph.addEdge("A", "B", 4);
    const state = toGraphVisualizationState(
      {
        nodes: graph.getNodes(),
        edges: graph.getEdges(),
        directed: false,
        currentNode: "B",
        visitedNodes: ["A"],
        targetNode: "B",
        distances: { A: 0, B: 4 },
      },
      2,
      metrics,
      "running"
    );
    expect(state.nodes.find((node) => node.id === "B")?.state).toBe("target");
    expect(state.nodes.find((node) => node.id === "A")?.state).toBe("visited");
    expect(state.edges[0]?.weight).toBe(4);
    expect(state.distances.B).toBe(4);
  });

  it("marks the relaxed edge as active", () => {
    const graph = new Graph(true);
    graph.addNode("A");
    graph.addNode("B");
    graph.addEdge("A", "B", 7);
    const state = toGraphVisualizationState(
      {
        nodes: graph.getNodes(),
        edges: graph.getEdges(),
        directed: true,
        activeEdges: ["A->B"],
        distances: { A: 0, B: 7 },
        parents: { B: "A" },
      },
      3,
      metrics,
      "running"
    );
    expect(state.edges[0]?.state).toBe("active");
    expect(state.nodes.find((node) => node.id === "B")?.parentId).toBe("A");
  });
});

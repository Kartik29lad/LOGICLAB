import { describe, expect, it } from "vitest";

import {
  DEFAULT_GRAPH_EXPERIMENT,
  graphEdgeKey,
  nextNodeId,
  validateGraphExperiment,
} from "../../../../src/features/visualizer/graph-editor";

describe("V2-17 Graph Editor", () => {
  it("uses deterministic edge identity for directed and undirected graphs", () => {
    expect(graphEdgeKey("B", "A", false)).toBe(graphEdgeKey("A", "B", false));
    expect(graphEdgeKey("B", "A", true)).not.toBe(graphEdgeKey("A", "B", true));
  });

  it("generates the next available node id", () => {
    expect(nextNodeId(DEFAULT_GRAPH_EXPERIMENT.nodes)).toBe("F");
  });

  it("validates A* targets and graph topology", () => {
    expect(
      validateGraphExperiment({ ...DEFAULT_GRAPH_EXPERIMENT, target: undefined }, "a-star")
    ).toContain("target");
    expect(validateGraphExperiment(DEFAULT_GRAPH_EXPERIMENT, "bfs")).toBeNull();
  });

  it("rejects duplicate edges and negative weights", () => {
    expect(
      validateGraphExperiment(
        {
          ...DEFAULT_GRAPH_EXPERIMENT,
          edges: [...DEFAULT_GRAPH_EXPERIMENT.edges, { source: "B", target: "A", weight: 1 }],
        },
        "bfs"
      )
    ).toContain("Duplicate edge");
    expect(
      validateGraphExperiment(
        { ...DEFAULT_GRAPH_EXPERIMENT, edges: [{ source: "A", target: "B", weight: -1 }] },
        "dijkstra"
      )
    ).toContain("non-negative");
  });
});

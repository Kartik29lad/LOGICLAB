import { describe, expect, it } from "vitest";

import { buildBubbleSortSteps } from "../../../src/core/algorithms/implementations/sorting/bubble-sort/bubble-sort.steps";
import { Graph } from "../../../src/core/graph/models/graph";
import { ArrayVisualAdapter } from "../../../src/core/visualization/adapters/array-visual-adapter";
import { GraphVisualAdapter } from "../../../src/core/visualization/adapters/graph-visual-adapter";

describe("Phase 7: Visualization State Adapters", () => {
  describe("ArrayVisualAdapter", () => {
    it("transforms an array step into an ArrayVisualState with element states", () => {
      const trace = buildBubbleSortSteps([5, 2, 8]);
      const compareStep = trace.steps.find((s) => s.action === "compare")!;

      const visualState = ArrayVisualAdapter.adaptStep(compareStep, [5, 2, 8]);
      expect(visualState.type).toBe("array");
      expect(visualState.elements).toHaveLength(3);

      const comparingElements = visualState.elements.filter((e) => e.state === "comparing");
      expect(comparingElements.length).toBeGreaterThanOrEqual(1);

      expect(visualState.pointers["j"]).toBeDefined();
    });

    it("marks elements as sorted in completion steps", () => {
      const trace = buildBubbleSortSteps([3, 1]);
      const completeStep = trace.steps[trace.steps.length - 1]!;

      const visualState = ArrayVisualAdapter.adaptStep(completeStep);
      expect(visualState.elements.every((e) => e.state === "sorted")).toBe(true);
    });
  });

  describe("GraphVisualAdapter", () => {
    it("transforms a graph and path context into a GraphVisualState", () => {
      const g = new Graph(true);
      g.addNode("A", "Node A", 0, 0);
      g.addNode("B", "Node B", 10, 10);
      g.addEdge("A", "B", 5);

      const visual = GraphVisualAdapter.adaptGraph(g, {
        currentNodeId: "A",
        visitedNodes: ["A"],
        shortestPath: ["A", "B"],
      });

      expect(visual.type).toBe("graph");
      expect(visual.nodes).toHaveLength(2);
      expect(visual.edges).toHaveLength(1);

      const nodeA = visual.nodes.find((n) => n.id === "A");
      expect(nodeA?.state).toBe("current");

      const edgeAB = visual.edges[0];
      expect(edgeAB?.state).toBe("shortest-path");
    });
  });
});

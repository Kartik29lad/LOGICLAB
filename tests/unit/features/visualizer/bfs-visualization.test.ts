import { describe, expect, it } from "vitest";

import { deriveBfsStepView } from "@/features/visualizer/bfs-visualization";

function step(type: string, payload: Record<string, unknown>, stateAfter: Record<string, unknown>) {
  return {
    stepIndex: 0,
    event: { stepIndex: 0, type, payload, stateBefore: {}, stateAfter, metrics: {} },
    stateBefore: {},
    stateAfter,
    metrics: {},
  } as never;
}

describe("BFS visualization", () => {
  it("exposes the real queue and discovery level", () => {
    const view = deriveBfsStepView(
      step(
        "ENQUEUE",
        {
          node: "B",
          queue: ["C", "B"],
          visited: ["A"],
          distances: { A: 0, B: 1 },
          parents: { A: null, B: "A" },
          current: "A",
        },
        {
          queue: ["C", "B"],
          visited: ["A"],
          distances: { A: 0, B: 1 },
          predecessors: { A: null, B: "A" },
          current: "A",
        }
      )
    );
    expect(view.queue).toEqual(["C", "B"]);
    expect(view.discovered).toEqual(["A", "B"]);
    expect(view.distances.B).toBe(1);
    expect(view.currentEdge).toEqual({ source: "A", target: "B" });
    expect(view.phase).toBe("discover");
  });

  it("keeps traversal order separate from the queue", () => {
    const view = deriveBfsStepView(
      step(
        "VISIT",
        {
          node: "B",
          queue: ["C"],
          visited: ["A", "B"],
          distances: { A: 0, B: 1, C: 1 },
          parents: { A: null, B: "A", C: "A" },
          current: "B",
        },
        {
          queue: ["C"],
          visited: ["A", "B"],
          distances: { A: 0, B: 1, C: 1 },
          predecessors: { A: null, B: "A", C: "A" },
          current: "B",
        }
      )
    );
    expect(view.traversalOrder).toEqual(["A", "B"]);
    expect(view.queue).toEqual(["C"]);
    expect(view.phase).toBe("visit");
  });
});

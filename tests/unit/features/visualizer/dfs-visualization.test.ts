import { describe, expect, it } from "vitest";

import { deriveDfsStepView } from "@/features/visualizer/dfs-visualization";

function step(
  type: string,
  stateAfter: Record<string, unknown>,
  payload?: Record<string, unknown>
): Parameters<typeof deriveDfsStepView>[0] {
  return {
    stepIndex: 0,
    stateBefore: {},
    stateAfter,
    event: { stepIndex: 0, type: type as never, payload },
    metrics: {
      comparisons: 0,
      swaps: 0,
      reads: 0,
      writes: 0,
      visits: 0,
      iterations: 0,
      elapsedMs: 0,
    },
  };
}

describe("deriveDfsStepView", () => {
  it("exposes recursion stack and active path", () => {
    const view = deriveDfsStepView(
      step("VISIT", {
        stack: ["A", "B"],
        visited: ["A", "B"],
        traversalOrder: ["A", "B"],
        currentPath: ["A", "B"],
        current: "B",
        phase: "visit",
      })
    );
    expect(view.stack).toEqual(["A", "B"]);
    expect(view.currentPath).toEqual(["A", "B"]);
    expect(view.current).toBe("B");
    expect(view.phase).toBe("visit");
  });

  it("identifies a backtrack transition", () => {
    const view = deriveDfsStepView(
      step(
        "BACKTRACK",
        {
          stack: ["A"],
          visited: ["A", "B"],
          traversalOrder: ["A", "B"],
          currentPath: ["A"],
          current: "A",
          phase: "backtrack",
        },
        { node: "B", returnTo: "A", currentEdge: { source: "B", target: "A" } }
      )
    );
    expect(view.phase).toBe("backtrack");
    expect(view.backtrackedFrom).toBe("B");
    expect(view.returnTo).toBe("A");
    expect(view.currentEdge).toEqual({ source: "B", target: "A" });
  });
});

import { describe, expect, it } from "vitest";

import { createTreeTrace, DEFAULT_TREE_EXPERIMENT } from "@/features/visualizer/tree-laboratory";

describe("Tree laboratory", () => {
  it("keeps parent-child hierarchy in trace state", async () => {
    const trace = await createTreeTrace(DEFAULT_TREE_EXPERIMENT);
    interface TreeNodeState {
      value?: number;
      left?: TreeNodeState;
      right?: TreeNodeState;
    }
    const state = trace.steps[0]?.stateAfter as { root?: TreeNodeState } | undefined;
    expect(state?.root?.value).toBe(50);
    expect(state?.root?.left?.value).toBe(30);
    expect(state?.root?.right?.value).toBe(70);
  });
  it("supports operation traces", async () => {
    const trace = await createTreeTrace({ values: [50, 30, 70], operation: "insert", target: 60 });
    expect(
      trace.steps.some(
        (step) => (step.event.payload as Record<string, unknown> | undefined)?.value === 60
      )
    ).toBe(true);
  });
});

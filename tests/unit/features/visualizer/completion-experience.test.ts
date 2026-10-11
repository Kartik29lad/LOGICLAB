import { describe, expect, it } from "vitest";

import { buildCompletionSummary } from "@/features/visualizer/completion-experience";

describe("completion experience", () => {
  it("summarizes a canonical trace without deriving algorithm state", () => {
    const trace = {
      steps: [{ event: { description: "done" } }],
      metrics: { comparisons: 2, swaps: 1, writes: 3, visits: 4 },
    } as never;
    expect(buildCompletionSummary(trace)).toEqual({
      steps: 1,
      comparisons: 2,
      swaps: 1,
      writes: 3,
      visits: 4,
      result: "done",
    });
  });
});

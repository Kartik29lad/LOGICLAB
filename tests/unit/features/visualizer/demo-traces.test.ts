import { describe, expect, it } from "vitest";

import { createDemoTrace } from "@/features/visualizer/demo-traces";

describe("visualizer traces", () => {
  for (const slug of [
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
  ]) {
    it(`${slug} has a deterministic trace`, async () => {
      const trace = await createDemoTrace(slug);
      expect(trace.steps.length).toBeGreaterThan(1);
      expect(trace.steps[0]?.stepIndex).toBe(0);
      expect(trace.steps.at(-1)?.event.type).toBe("COMPLETE");
      for (let i = 1; i < trace.steps.length; i++)
        expect(trace.steps[i]!.stateBefore).toEqual(trace.steps[i - 1]!.stateAfter);
    });
  }
});

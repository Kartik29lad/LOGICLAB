import { describe, expect, it } from "vitest";

import { createDemoTrace } from "@/features/visualizer/demo-traces";
import { traceStepToVisualization } from "@/features/visualizer/render-state";
import { getRenderer, RENDERER_REGISTRY } from "@/features/visualizer/renderer-registry";

import { makeArrayTrace, makeGraphTrace } from "../../../../helpers/visualizer-fixtures";

describe("V2 visualization contracts", () => {
  it("derives array semantic states from canonical events", () => {
    const trace = makeArrayTrace();
    const state = traceStepToVisualization("bubble-sort", trace, trace.steps[1], "running");
    expect(state.type).toBe("array");
    expect(state.visualization).toMatchObject({
      elementStates: { 0: "swapping", 1: "swapping" },
      activeIndexes: [0, 1],
    });
  });

  it("keeps only the found target highlighted on binary-search completion", async () => {
    const trace = await createDemoTrace("binary-search", { array: [2, 5, 7, 9, 13], target: 9 });
    const last = traceStepToVisualization("binary-search", trace, trace.steps.at(-1)!, "completed");
    expect(last.visualization).toMatchObject({
      type: "array",
      elementStates: { 0: "disabled", 1: "disabled", 2: "disabled", 3: "success", 4: "disabled" },
    });
  });

  it("derives graph state from canonical BFS events", () => {
    const trace = makeGraphTrace();
    const state = traceStepToVisualization("bfs", trace, trace.steps[2], "running");
    expect(state.type).toBe("graph");
    expect(state.visualization).toMatchObject({ algorithmMode: "bfs" });
  });

  it("keeps every registered visualization type discoverable", () => {
    for (const type of Object.keys(RENDERER_REGISTRY)) expect(getRenderer(type)?.type).toBe(type);
  });
});

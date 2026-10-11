import { describe, expect, it } from "vitest";

import { deriveVisualizationSessionState } from "@/features/visualizer/state-model";

describe("visualizer state separation", () => {
  it("keeps interaction state separate from visualization state", () => {
    const visualization = {
      type: "array",
      stepIndex: 2,
      activeElements: [],
      highlightedElements: [],
      visitedNodes: [],
      queueState: [],
      stackState: [],
      metrics: {},
      status: "ready",
      elements: [],
      pointers: {},
    } as never;
    const result = deriveVisualizationSessionState(
      {
        playback: { trace: null, step: 2, status: "READY", speed: 1 },
        input: { array: [1], linear: [], graph: null, tree: null },
        interaction: {
          predictionMode: true,
          focusMode: true,
          presentationMode: false,
          fullscreen: false,
        },
        error: null,
      },
      visualization
    );
    expect(result?.executionTraceStep).toBe(2);
    expect(result).not.toHaveProperty("predictionMode");
  });
});

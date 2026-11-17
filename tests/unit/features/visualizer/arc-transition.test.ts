import { describe, expect, it } from "vitest";

import type { ArrayVisualState } from "@/contracts/events/visualization-state";
import { createAnimationIntent } from "@/core/visualization/motion/animation-intent";
import type { ElementRectSnapshot } from "@/features/visualizer/motion/element-registry";
import { GsapMotionEngine } from "@/features/visualizer/motion/gsap-motion-engine";
import {
  buildArrayStepTimeline,
  computeFlipDeltas,
  computeSwapArcProfiles,
} from "@/features/visualizer/motion/presets/array-presets";

describe("Phase 4 array FLIP and arc transitions", () => {
  it("computes accurate FLIP deltas from pre-commit and post-commit rects", () => {
    const prev = new Map<string, ElementRectSnapshot>([
      ["array-0", { id: "array-0", left: 40, top: 100, width: 48, height: 120 }],
      ["array-1", { id: "array-1", left: 110, top: 100, width: 48, height: 90 }],
    ]);
    const next = new Map<string, ElementRectSnapshot>([
      ["array-0", { id: "array-0", left: 110, top: 100, width: 48, height: 120 }],
      ["array-1", { id: "array-1", left: 40, top: 100, width: 48, height: 90 }],
    ]);

    const deltas = computeFlipDeltas(["array-0", "array-1"], prev, next);
    expect(deltas).toEqual([
      { id: "array-0", dx: -70, dy: 0 },
      { id: "array-1", dx: 70, dy: 0 },
    ]);

    const arcs = computeSwapArcProfiles(deltas, 28);
    expect(arcs[0]?.peakYOffset).toBeLessThan(0);
    expect(arcs[1]?.peakYOffset).toBeGreaterThan(0);
    // Opposite signs guarantee zero midpoint vertical collision during swap
    expect(Math.sign(arcs[0]!.peakYOffset)).not.toBe(Math.sign(arcs[1]!.peakYOffset));
  });

  it("executes a swap timeline via GsapMotionEngine and settles cleanly", async () => {
    const el0 = { style: { willChange: "" }, x: 0, y: 0, zIndex: 1 } as unknown as HTMLElement;
    const el1 = { style: { willChange: "" }, x: 0, y: 0, zIndex: 1 } as unknown as HTMLElement;
    const elements = new Map<string, Element>([
      ["array-0", el0],
      ["array-1", el1],
    ]);
    const prev = new Map<string, ElementRectSnapshot>([
      ["array-0", { id: "array-0", left: 0, top: 0, width: 40, height: 80 }],
      ["array-1", { id: "array-1", left: 80, top: 0, width: 40, height: 60 }],
    ]);
    const next = new Map<string, ElementRectSnapshot>([
      ["array-0", { id: "array-0", left: 80, top: 0, width: 40, height: 80 }],
      ["array-1", { id: "array-1", left: 0, top: 0, width: 40, height: 60 }],
    ]);

    const state: ArrayVisualState = {
      type: "array",
      stepIndex: 1,
      activeElements: [0, 1],
      highlightedElements: [0, 1],
      visitedNodes: [],
      queueState: [],
      stackState: [],
      metrics: {
        comparisons: 1,
        swaps: 1,
        reads: 0,
        writes: 0,
        visits: 0,
        iterations: 2,
        elapsedMs: 0,
      },
      status: "running",
      elements: [
        { id: "array-1", value: 3, originalIndex: 1, currentIndex: 0, state: "swapping" },
        { id: "array-0", value: 7, originalIndex: 0, currentIndex: 1, state: "swapping" },
      ],
      pointers: {},
    };

    const intent = createAnimationIntent(
      { stepIndex: 1, type: "SWAP", payload: { indexes: [0, 1] } },
      ["array-1", "array-0"]
    );
    const engine = new GsapMotionEngine({ speed: 4 });
    const handle = buildArrayStepTimeline({
      engine,
      intent,
      state,
      prevRects: prev,
      nextRects: next,
      elements,
      generation: 1,
    });

    expect(handle).not.toBeNull();
    const res = await handle!.result;
    expect(res?.outcome).toBe("completed");
  });
});

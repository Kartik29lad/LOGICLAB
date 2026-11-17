import { afterEach, describe, expect, it, vi } from "vitest";

import { describeExecutionStep } from "@/features/visualizer/accessibility";
import {
  LARGE_TRACE_MOTION_LIMITS,
  shouldBypassMotionForLargeTrace,
} from "@/features/visualizer/large-trace-strategy";
import { GsapMotionEngine } from "@/features/visualizer/motion/gsap-motion-engine";
import { isReducedMotionActive } from "@/features/visualizer/motion/reduced-motion";
import { StepPresentationCoordinator } from "@/features/visualizer/motion/step-presentation-coordinator";

describe("Phase 9 reduced motion, large-trace fallback, and accessibility", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("detects reduced motion from matchMedia and document dataset", () => {
    expect(isReducedMotionActive()).toBe(false);

    vi.stubGlobal("document", { documentElement: { dataset: { reducedMotion: "true" } } });
    vi.stubGlobal("window", { matchMedia: () => ({ matches: false }) });
    expect(isReducedMotionActive()).toBe(true);

    vi.stubGlobal("document", { documentElement: { dataset: {} } });
    vi.stubGlobal("window", { matchMedia: () => ({ matches: true }) });
    expect(isReducedMotionActive()).toBe(true);
  });

  it("bypasses coordinator timelines immediately when reduced motion is enabled", async () => {
    const engine = new GsapMotionEngine({ reducedMotion: false });
    const coordinator = new StepPresentationCoordinator({ engine });
    const buildSpy = vi.fn();

    coordinator.setReducedMotion(true);

    let generation = 0;
    const promise = coordinator.beginStepTransition(
      { stepIndex: 1, mode: "animate", generation: 1 },
      (meta) => {
        generation = meta.generation;
      }
    );

    coordinator.presentCommittedStep(generation, (ctx) =>
      ctx.engine.runTimeline(buildSpy, [], { operation: "SWAP" })
    );

    await promise;
    expect(buildSpy).not.toHaveBeenCalled();
    coordinator.dispose();
  });

  it("activates instant settle fallback for large traces and preserves accessibility descriptions", () => {
    expect(shouldBypassMotionForLargeTrace(LARGE_TRACE_MOTION_LIMITS.maxAnimatedSteps, 10)).toBe(
      false
    );
    expect(
      shouldBypassMotionForLargeTrace(LARGE_TRACE_MOTION_LIMITS.maxAnimatedSteps + 1, 10)
    ).toBe(true);
    expect(
      shouldBypassMotionForLargeTrace(20, LARGE_TRACE_MOTION_LIMITS.maxAnimatedInputSize + 1)
    ).toBe(true);

    const a11y = describeExecutionStep("Bubble Sort", 1, 8, "SWAP", "Swap indices 0 and 1");
    expect(a11y.label).toContain("Bubble Sort");
    expect(a11y.liveAnnouncement).toContain("Step 2 of 8");
    expect(a11y.liveAnnouncement).toContain("Swap indices 0 and 1");
  });
});

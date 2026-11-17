import { describe, expect, it, vi } from "vitest";

import { PlaybackController } from "@/core/visualization/playback/playback-controller";
import { createDemoTrace } from "@/features/visualizer/demo-traces";
import { VisualizerElementRegistry } from "@/features/visualizer/motion/element-registry";
import { GsapMotionEngine } from "@/features/visualizer/motion/gsap-motion-engine";
import { StepPresentationCoordinator } from "@/features/visualizer/motion/step-presentation-coordinator";

describe("Phase 3 playback synchronization and coordinator", () => {
  it("pauses and resumes active animations without cancelling progress", async () => {
    vi.useFakeTimers();
    const trace = await createDemoTrace("bubble-sort");
    let resolveStep1!: () => void;
    const paused = vi.fn();
    const resumed = vi.fn();
    const cancelled = vi.fn();

    const controller = new PlaybackController({
      trace,
      stepDurationMs: 400,
      postStepDwellMs: 100,
      onStep: (step) => {
        if (step === 1) {
          return new Promise<void>((resolve) => {
            resolveStep1 = resolve;
          });
        }
        return undefined;
      },
      onAnimationPause: paused,
      onAnimationResume: resumed,
      onAnimationCancel: cancelled,
    });

    controller.play();
    vi.advanceTimersByTime(100);
    expect(controller.snapshot.status).toBe("ANIMATING");
    expect(controller.snapshot.currentStep).toBe(1);

    controller.pause();
    expect(controller.snapshot.status).toBe("PAUSED");
    expect(paused).toHaveBeenCalledTimes(1);
    expect(cancelled).not.toHaveBeenCalled();

    controller.resume();
    expect(controller.snapshot.status).toBe("ANIMATING");
    expect(resumed).toHaveBeenCalledTimes(1);

    resolveStep1();
    await Promise.resolve();
    expect(controller.snapshot.status).toBe("PLAYING");

    controller.dispose();
    vi.useRealTimers();
  });

  it("propagates speed changes to active timelines and respects cadence interval", async () => {
    vi.useFakeTimers();
    const trace = await createDemoTrace("bubble-sort");
    const speedSpy = vi.fn();
    let resolveStep1!: () => void;

    const controller = new PlaybackController({
      trace,
      stepDurationMs: 600,
      postStepDwellMs: 100,
      onStep: (step) =>
        step === 1
          ? new Promise<void>((resolve) => {
              resolveStep1 = resolve;
            })
          : undefined,
      onSpeedChange: speedSpy,
    });

    controller.play();
    vi.advanceTimersByTime(100);
    expect(controller.snapshot.status).toBe("ANIMATING");

    controller.setSpeed(2);
    expect(speedSpy).toHaveBeenCalledWith(2);

    // Simulate 200ms elapsed during step 1 animation; target interval at 2x is 300ms -> remaining 100ms
    vi.advanceTimersByTime(200);
    resolveStep1();
    await Promise.resolve();
    expect(controller.snapshot.currentStep).toBe(1);

    vi.advanceTimersByTime(99);
    expect(controller.snapshot.currentStep).toBe(1);
    vi.advanceTimersByTime(1);
    expect(controller.snapshot.currentStep).toBe(2);

    controller.dispose();
    vi.useRealTimers();
  });

  it("awaits manual next and settles immediately on previous/seek", async () => {
    const trace = await createDemoTrace("bubble-sort");
    const modes: string[] = [];
    let resolveNext!: () => void;

    const controller = new PlaybackController({
      trace,
      onStep: (step, ctx) => {
        modes.push(`${step}:${ctx?.mode ?? "none"}`);
        if (step === 1 && ctx?.mode === "animate") {
          return new Promise<void>((resolve) => {
            resolveNext = resolve;
          });
        }
        return undefined;
      },
    });

    controller.next();
    expect(controller.snapshot.currentStep).toBe(1);
    expect(controller.snapshot.status).toBe("ANIMATING");

    // Previous cancels active manual motion and immediately settles
    controller.previous();
    expect(controller.snapshot.currentStep).toBe(0);
    expect(controller.snapshot.status).toBe("PAUSED");
    resolveNext();
    await Promise.resolve();
    expect(controller.snapshot.status).toBe("PAUSED");

    controller.setStep(3);
    expect(modes).toEqual(["0:settle", "1:animate", "0:settle", "3:settle"]);
  });

  it("captures pre-commit rects and resolves coordinator promises cleanly on cancel or timeout", async () => {
    vi.useFakeTimers();
    const registry = new VisualizerElementRegistry();
    let xPos = 10;
    const mockEl = {
      style: { willChange: "" },
      getBoundingClientRect: () => ({ left: xPos, top: 0, width: 40, height: 80 }),
    } as unknown as HTMLElement;
    registry.register("array-0", mockEl);

    const engine = new GsapMotionEngine();
    const coordinator = new StepPresentationCoordinator({
      engine,
      registry,
      readinessTimeoutMs: 500,
    });

    let capturedGen = 0;
    const stepPromise = coordinator.beginStepTransition(
      { stepIndex: 1, mode: "animate", generation: 1 },
      (meta) => {
        capturedGen = meta.generation;
        xPos = 120;
      }
    );

    let measuredDelta = 0;
    coordinator.presentCommittedStep(capturedGen, (ctx) => {
      measuredDelta =
        (ctx.prevRects.get("array-0")?.left ?? 0) - (ctx.nextRects.get("array-0")?.left ?? 0);
      return ctx.engine.runTimeline((tl) => tl.to({ v: 0 }, { v: 1, duration: 1 }), [mockEl]);
    });

    expect(measuredDelta).toBe(-110);
    coordinator.cancelActive();
    await stepPromise;

    // Also verify readiness timeout safety when a dynamic chunk never commits
    const stuckPromise = coordinator.beginStepTransition(
      { stepIndex: 2, mode: "animate", generation: 2 },
      () => undefined
    );
    vi.advanceTimersByTime(500);
    await stuckPromise;

    coordinator.dispose();
    vi.useRealTimers();
  });
});

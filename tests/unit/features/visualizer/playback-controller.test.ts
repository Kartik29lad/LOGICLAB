import { describe, expect, it, vi } from "vitest";

import { PlaybackController } from "@/core/visualization/playback/playback-controller";
import { createDemoTrace } from "@/features/visualizer/demo-traces";

describe("PlaybackController", () => {
  it("navigates deterministically through previous, next, slider and restart", async () => {
    const trace = await createDemoTrace("bubble-sort");
    const seen: number[] = [];
    const controller = new PlaybackController({
      trace,
      onStep: (step) => {
        seen.push(step);
      },
    });
    controller.next();
    controller.next();
    expect(controller.snapshot.currentStep).toBe(2);
    controller.previous();
    expect(controller.snapshot.currentStep).toBe(1);
    controller.setStep(trace.steps.length - 1);
    expect(controller.snapshot.status).toBe("COMPLETED");
    controller.restart();
    expect(controller.snapshot.currentStep).toBe(0);
    expect(seen).toContain(2);
  });

  it("waits for an asynchronous visual transition before advancing", async () => {
    vi.useFakeTimers();
    const trace = await createDemoTrace("bubble-sort");
    let resolveAnimation!: () => void;
    const animation = new Promise<void>((resolve) => {
      resolveAnimation = resolve;
    });
    const seen: number[] = [];
    const controller = new PlaybackController({
      trace,
      stepDurationMs: 100,
      onStep: (step) => {
        seen.push(step);
        return step === 1 ? animation : undefined;
      },
    });

    controller.play();
    vi.advanceTimersByTime(100);
    await Promise.resolve();
    expect(controller.snapshot.status).toBe("ANIMATING");
    expect(controller.snapshot.currentStep).toBe(1);

    vi.advanceTimersByTime(1_000);
    expect(controller.snapshot.currentStep).toBe(1);

    resolveAnimation();
    await Promise.resolve();
    expect(controller.snapshot.status).toBe("PLAYING");
    vi.advanceTimersByTime(100);
    expect(controller.snapshot.currentStep).toBe(2);
    controller.dispose();
    vi.useRealTimers();
  });

  it("cancels pending automatic transitions on pause and seek", async () => {
    vi.useFakeTimers();
    const trace = await createDemoTrace("bubble-sort");
    const cancelled = vi.fn();
    const controller = new PlaybackController({
      trace,
      stepDurationMs: 100,
      onStep: () => undefined,
      onAnimationCancel: cancelled,
    });

    controller.play();
    vi.advanceTimersByTime(100);
    controller.pause();
    vi.advanceTimersByTime(10_000);
    expect(controller.snapshot.currentStep).toBe(1);
    expect(controller.snapshot.status).toBe("PAUSED");

    controller.setStep(4);
    expect(controller.snapshot.currentStep).toBe(4);
    expect(controller.snapshot.status).toBe("PAUSED");
    expect(cancelled).toHaveBeenCalled();
    controller.dispose();
    vi.useRealTimers();
  });

  it("restarts automatically after reaching the end and reports progress", async () => {
    vi.useFakeTimers();
    const trace = await createDemoTrace("binary-search");
    const controller = new PlaybackController({
      trace,
      stepDurationMs: 10,
      onStep: () => undefined,
    });
    controller.setStep(trace.steps.length - 1);
    expect(controller.snapshot.progress).toBe(1);
    controller.play();
    expect(controller.snapshot.currentStep).toBe(0);
    expect(controller.snapshot.status).toBe("PLAYING");
    controller.dispose();
    vi.useRealTimers();
  });

  it("supports only the documented speeds", async () => {
    const controller = new PlaybackController({
      trace: await createDemoTrace("binary-search"),
      onStep: () => undefined,
    });
    controller.setSpeed(4);
    expect(controller.snapshot.speed).toBe(4);
    expect(() => controller.setSpeed(3)).toThrow();
  });

  describe("Phase 4 Playback Race & Cancellation Contract", () => {
    it("handles play followed immediately by pause without advancing", async () => {
      vi.useFakeTimers();
      const trace = await createDemoTrace("bubble-sort");
      let stepsEmitted = 0;
      const controller = new PlaybackController({
        trace,
        stepDurationMs: 200,
        onStep: () => {
          stepsEmitted += 1;
        },
      });

      // Initial emit on mount
      expect(stepsEmitted).toBe(1);
      expect(controller.snapshot.currentStep).toBe(0);

      // Play then immediately pause
      controller.play();
      expect(controller.snapshot.status).toBe("PLAYING");
      controller.pause();
      expect(controller.snapshot.status).toBe("PAUSED");

      // Advance timers significantly
      vi.advanceTimersByTime(10_000);
      expect(controller.snapshot.currentStep).toBe(0);
      expect(controller.snapshot.status).toBe("PAUSED");
      expect(stepsEmitted).toBe(1);

      controller.dispose();
      vi.useRealTimers();
    });

    it("prevents stale async animation callbacks from overwriting state after restart", async () => {
      vi.useFakeTimers();
      const trace = await createDemoTrace("bubble-sort");
      let resolveStep1!: () => void;
      const step1Promise = new Promise<void>((resolve) => {
        resolveStep1 = resolve;
      });

      const controller = new PlaybackController({
        trace,
        stepDurationMs: 100,
        onStep: (step) => (step === 1 ? step1Promise : undefined),
      });

      controller.play();
      vi.advanceTimersByTime(100);
      await Promise.resolve();
      expect(controller.snapshot.status).toBe("ANIMATING");
      expect(controller.snapshot.currentStep).toBe(1);

      // User resets while animation is still pending in flight
      controller.restart();
      expect(controller.snapshot.currentStep).toBe(0);
      expect(controller.snapshot.status).toBe("READY");

      // Now the delayed animation completes
      resolveStep1();
      await Promise.resolve();

      // State MUST NOT be overwritten by stale callback
      expect(controller.snapshot.currentStep).toBe(0);
      expect(controller.snapshot.status).toBe("READY");

      // Verify timers do not advance from the stale token
      vi.advanceTimersByTime(5_000);
      expect(controller.snapshot.currentStep).toBe(0);

      controller.dispose();
      vi.useRealTimers();
    });

    it("handles rapid consecutive next/previous clicks safely and clamps within bounds", async () => {
      const trace = await createDemoTrace("bubble-sort");
      const stepsLog: number[] = [];
      const controller = new PlaybackController({
        trace,
        onStep: (step) => {
          stepsLog.push(step);
        },
      });

      // Rapid stepping
      controller.next();
      controller.next();
      controller.next();
      controller.previous();
      controller.next();

      expect(controller.snapshot.currentStep).toBe(3);
      expect(controller.snapshot.status).toBe("PAUSED");

      // Boundary tests
      for (let i = 0; i < 50; i++) controller.previous();
      expect(controller.snapshot.currentStep).toBe(0);

      for (let i = 0; i < 100; i++) controller.next();
      expect(controller.snapshot.currentStep).toBe(trace.steps.length - 1);
      expect(controller.snapshot.status).toBe("COMPLETED");

      controller.dispose();
    });

    it("cancels active playback when scrubbing the timeline slider", async () => {
      vi.useFakeTimers();
      const trace = await createDemoTrace("bubble-sort");
      const cancelled = vi.fn();
      const controller = new PlaybackController({
        trace,
        stepDurationMs: 200,
        onStep: () => undefined,
        onAnimationCancel: cancelled,
      });

      controller.play();
      expect(controller.snapshot.status).toBe("PLAYING");

      // Scrub to step 5 mid-flight
      controller.setStep(5);
      expect(controller.snapshot.currentStep).toBe(5);
      expect(controller.snapshot.status).toBe("PAUSED");
      expect(cancelled).toHaveBeenCalled();

      // Advancing timer does not automatically continue
      vi.advanceTimersByTime(5_000);
      expect(controller.snapshot.currentStep).toBe(5);

      controller.dispose();
      vi.useRealTimers();
    });

    it("adjusts timing smoothly when speed is changed during playback", async () => {
      vi.useFakeTimers();
      const trace = await createDemoTrace("bubble-sort");
      const controller = new PlaybackController({
        trace,
        stepDurationMs: 1_000,
        onStep: () => undefined,
      });

      controller.play();
      // At 1x speed, 500ms is not enough to step
      vi.advanceTimersByTime(500);
      expect(controller.snapshot.currentStep).toBe(0);

      // Increase speed to 2x (effective delay becomes 500ms)
      controller.setSpeed(2);
      expect(controller.snapshot.speed).toBe(2);

      // At 2x speed (500ms delay), advancing 500ms completes the step
      vi.advanceTimersByTime(500);
      expect(controller.snapshot.currentStep).toBe(1);

      controller.dispose();
      vi.useRealTimers();
    });

    it("prevents duplicate timers when play is clicked repeatedly", async () => {
      vi.useFakeTimers();
      const trace = await createDemoTrace("bubble-sort");
      const controller = new PlaybackController({
        trace,
        stepDurationMs: 100,
        onStep: () => undefined,
      });

      // Spam play 5 times
      controller.play();
      controller.play();
      controller.play();
      controller.play();
      controller.play();

      expect(controller.snapshot.status).toBe("PLAYING");

      // Advance by 1 step interval
      vi.advanceTimersByTime(100);
      // Exactly 1 step advanced, not 5
      expect(controller.snapshot.currentStep).toBe(1);

      controller.dispose();
      vi.useRealTimers();
    });

    it("cancels all scheduled operations on dispose / unmount", async () => {
      vi.useFakeTimers();
      const trace = await createDemoTrace("bubble-sort");
      let stepsEmitted = 0;
      const controller = new PlaybackController({
        trace,
        stepDurationMs: 100,
        onStep: () => {
          stepsEmitted += 1;
        },
      });

      controller.play();
      controller.dispose();
      expect(controller.snapshot.status).toBe("IDLE");

      const countAtDispose = stepsEmitted;
      vi.advanceTimersByTime(10_000);
      expect(stepsEmitted).toBe(countAtDispose);

      vi.useRealTimers();
    });
  });
});

import { describe, expect, it, vi } from "vitest";

import { MotionEngine } from "@/core/visualization/motion/motion-engine";

describe("MotionEngine", () => {
  it("executes non-transform operation types through Web Animations API", async () => {
    const animate = vi.fn((_keyframes?: unknown, _options?: unknown) => ({
      finished: Promise.resolve(),
      cancel: vi.fn(),
    }));
    const element = { animate, dataset: {} } as unknown as HTMLElement;
    const engine = new MotionEngine({ speed: 2 });

    const handle = engine.play(
      {
        intentId: "intent-1",
        execution: "parallel",
        durationMs: 200,
        interruptible: true,
        reducedMotion: "settle",
        operations: [
          {
            id: "opacity",
            targetId: "a",
            property: "opacity",
            from: 0,
            to: 1,
            durationMs: 200,
            easing: "linear",
            intentId: "intent-1",
          },
          {
            id: "scale",
            targetId: "a",
            property: "scale",
            from: 0.9,
            to: 1,
            durationMs: 200,
            easing: "linear",
            intentId: "intent-1",
          },
          {
            id: "highlight",
            targetId: "a",
            property: "highlight",
            from: 1,
            to: 1.2,
            durationMs: 200,
            easing: "linear",
            intentId: "intent-1",
          },
        ],
      },
      new Map([["a", element]])
    );

    await handle.promise;
    expect(animate).toHaveBeenCalledTimes(3);
    expect(animate.mock.calls[0]?.[0]).toEqual([{ opacity: 0 }, { opacity: 1 }]);
    expect(animate.mock.calls[1]?.[0]).toEqual([
      { transform: "scale(0.9)" },
      { transform: "scale(1)" },
    ]);
    expect(animate.mock.calls[2]?.[0]).toEqual([
      { filter: "brightness(1)" },
      { filter: "brightness(1.2)" },
    ]);
  });

  it("applies state operations without creating an animation", async () => {
    const animate = vi.fn();
    const element = { animate, dataset: {} } as unknown as HTMLElement;
    const engine = new MotionEngine();

    await engine.play(
      {
        intentId: "intent-2",
        execution: "serial",
        durationMs: 100,
        interruptible: true,
        reducedMotion: "settle",
        operations: [
          {
            id: "state",
            targetId: "a",
            property: "state",
            from: "default",
            to: "active",
            durationMs: 100,
            easing: "linear",
            intentId: "intent-2",
          },
        ],
      },
      new Map([["a", element]])
    ).promise;

    expect(element.dataset.motionState).toBe("active");
    expect(animate).not.toHaveBeenCalled();
  });
});

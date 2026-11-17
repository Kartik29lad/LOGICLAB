import { describe, expect, it } from "vitest";

import { GsapMotionEngine } from "@/features/visualizer/motion/gsap-motion-engine";

describe("Phase 2 motion cancellation and failure settlement", () => {
  it("settles promises cleanly when cancelled mid-timeline", async () => {
    const target = { style: { willChange: "" }, x: 0 } as unknown as HTMLElement & { x: number };
    const engine = new GsapMotionEngine();

    const handle = engine.runTimeline(
      (tl) => {
        tl.to(target, { x: 200, duration: 2 });
      },
      [target],
      { scope: "array", renderer: "array", operation: "SWAP" }
    );

    expect(engine.getActiveCount()).toBe(1);
    handle.cancel();

    const result = await handle.result;
    await handle.promise;
    expect(result?.outcome).toBe("cancelled");
    expect(engine.getActiveCount()).toBe(0);
    expect(target.style.willChange).toBe("");
  });

  it("cancels only matching scope via cancelAll(scope)", async () => {
    const a = { style: { willChange: "" }, x: 0 } as unknown as Element & { x: number };
    const b = { style: { willChange: "" }, x: 0 } as unknown as Element & { x: number };
    const engine = new GsapMotionEngine();

    const handleA = engine.runTimeline((tl) => tl.to(a, { x: 50, duration: 1 }), [a], {
      scope: "array",
    });
    const handleB = engine.runTimeline((tl) => tl.to(b, { x: 50, duration: 0.04 }), [b], {
      scope: "graph",
    });

    engine.cancelAll("array");
    expect((await handleA.result)?.outcome).toBe("cancelled");
    expect((await handleB.result)?.outcome).toBe("completed");
  });

  it("settles safely if timeline construction throws", async () => {
    const target = { style: { willChange: "" } } as unknown as HTMLElement;
    const engine = new GsapMotionEngine();

    const handle = engine.runTimeline(
      () => {
        throw new Error("Simulated GSAP failure");
      },
      [target],
      { renderer: "tree", operation: "ROTATE" }
    );

    const result = await handle.result;
    await handle.promise;
    expect(result?.outcome).toBe("settled-after-error");
    expect(result?.reason).toContain("Simulated GSAP failure");
    expect(engine.getActiveCount()).toBe(0);
    expect(target.style.willChange).toBe("");
  });
});

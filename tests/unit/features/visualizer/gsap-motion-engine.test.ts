import { describe, expect, it, vi } from "vitest";

import { VisualizerElementRegistry } from "@/features/visualizer/motion/element-registry";
import { GsapMotionEngine } from "@/features/visualizer/motion/gsap-motion-engine";
import { defaultSvgGeometryAdapter } from "@/features/visualizer/motion/svg-geometry-adapter";

describe("Phase 2 GsapMotionEngine & SVG geometry", () => {
  it("runs a GSAP timeline, updates speed in flight, pauses/resumes, and cleans up will-change", async () => {
    const diagnostics: string[] = [];
    const target = {
      style: { willChange: "" } as CSSStyleDeclaration,
      x: 0,
    } as unknown as HTMLElement & { x: number };

    const engine = new GsapMotionEngine({
      speed: 2,
      onDiagnostic: (d) => diagnostics.push(`${d.renderer}:${d.operation}:${d.outcome}`),
    });

    const handle = engine.runTimeline(
      (tl) => {
        tl.to(target, { x: 100, duration: 0.08 });
      },
      [target],
      { renderer: "array", operation: "SWAP", generation: 1 }
    );

    expect(target.style.willChange).toBe("transform, opacity");
    expect(engine.getActiveCount()).toBe(1);

    handle.pause?.();
    handle.setSpeed?.(4);
    handle.resume?.();

    const result = await handle.result;
    expect(result?.outcome).toBe("completed");
    expect(target.x).toBe(100);
    expect(target.style.willChange).toBe("");
    expect(engine.getActiveCount()).toBe(0);
    expect(diagnostics).toEqual(["array:SWAP:completed"]);
  });

  it("bypasses GSAP timelines and settles immediately in reduced-motion mode", async () => {
    const target = { style: { willChange: "" } } as unknown as HTMLElement;
    const engine = new GsapMotionEngine({ reducedMotion: true });
    const buildSpy = vi.fn();

    const handle = engine.runTimeline(buildSpy, [target], {
      renderer: "tree",
      operation: "INSERT",
    });

    const result = await handle.result;
    expect(result?.outcome).toBe("completed");
    expect(result?.reason).toBe("reduced-motion");
    expect(buildSpy).not.toHaveBeenCalled();
  });

  it("handles SVG geometry fallback when native SVG methods are unavailable", () => {
    const svgPath = {
      getAttribute: (name: string) => (name === "d" ? "M 10 20 L 40 60" : null),
    } as unknown as SVGElement;

    expect(defaultSvgGeometryAdapter.getTotalLength(svgPath)).toBe(50);
    expect(defaultSvgGeometryAdapter.getPointAtLength(svgPath, 25)).toEqual({ x: 25, y: 40 });
  });

  it("batches element registry measurements and tracks readiness", () => {
    const registry = new VisualizerElementRegistry();
    const listener = vi.fn();
    const unsub = registry.subscribe(listener);

    const el = {
      getBoundingClientRect: () => ({ left: 10, top: 20, width: 40, height: 80 }),
    } as unknown as Element;

    registry.register("array-0", el);
    expect(listener).toHaveBeenCalledTimes(1);
    const rects = registry.measureRects(["array-0"]);
    expect(rects.get("array-0")).toEqual({
      id: "array-0",
      left: 10,
      top: 20,
      width: 40,
      height: 80,
    });
    unsub();
  });
});

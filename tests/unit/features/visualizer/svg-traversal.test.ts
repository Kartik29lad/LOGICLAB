import { describe, expect, it, vi } from "vitest";

import type { GraphVisualState } from "@/contracts/events/visualization-state";
import { createAnimationIntent } from "@/core/visualization/motion/animation-intent";
import { GsapMotionEngine } from "@/features/visualizer/motion/gsap-motion-engine";
import { buildGraphStepTimeline } from "@/features/visualizer/motion/presets/graph-presets";
import type { SvgGeometryPort } from "@/features/visualizer/motion/svg-geometry-adapter";

describe("Phase 5 graph SVG traversal choreography", () => {
  it("animates edge strokeDashoffset and moves tracer along SVG path geometry", async () => {
    const attrs = new Map<string, string>();
    const edgeEl = {
      style: { willChange: "" },
      strokeDasharray: "",
      strokeDashoffset: 0,
      setAttribute: vi.fn((k: string, v: string) => attrs.set(k, v)),
      getAttribute: (k: string) => (k === "d" ? "M 80 80 L 240 80" : (attrs.get(k) ?? null)),
    } as unknown as SVGPathElement;

    const tracerAttrs: Record<string, string> = {};
    const tracerEl = {
      style: { willChange: "" },
      opacity: 0,
      setAttribute: vi.fn((k: string, v: string) => {
        tracerAttrs[k] = v;
      }),
    } as unknown as SVGCircleElement;

    const targetNodeEl = {
      style: { willChange: "" },
      scale: 1,
      transformOrigin: "center center",
    } as unknown as SVGGElement;
    const elements = new Map<string, Element>([
      ["edge:A->B", edgeEl],
      ["graph-tracer", tracerEl],
      ["B", targetNodeEl],
    ]);

    const geometry: SvgGeometryPort = {
      getTotalLength: () => 160,
      getPointAtLength: (_el, d) => ({ x: 80 + d, y: 80 }),
    };

    const state: GraphVisualState = {
      type: "graph",
      stepIndex: 1,
      activeElements: ["B"],
      highlightedElements: ["A->B"],
      visitedNodes: ["A"],
      discoveredNodes: ["A", "B"],
      traversalOrder: ["A"],
      queueState: ["B"],
      stackState: [],
      currentPath: [],
      path: [],
      distances: { A: 0, B: 1 },
      parents: { B: "A" },
      directed: true,
      currentNode: "A",
      currentEdge: { source: "A", target: "B" },
      nodes: [
        { id: "A", label: "A", x: 80, y: 80, state: "current" },
        { id: "B", label: "B", x: 240, y: 80, state: "discovered" },
      ],
      edges: [{ id: "edge:A->B", source: "A", target: "B", weight: 1, state: "active" }],
      metrics: {
        comparisons: 0,
        swaps: 0,
        reads: 0,
        writes: 0,
        visits: 1,
        iterations: 1,
        elapsedMs: 0,
      },
      status: "running",
    };

    const intent = createAnimationIntent(
      { stepIndex: 1, type: "ENQUEUE", payload: { node: "B" } },
      ["edge:A->B", "B"]
    );
    const engine = new GsapMotionEngine({ speed: 4 });
    const handle = buildGraphStepTimeline({
      engine,
      intent,
      state,
      elements,
      generation: 1,
      geometry,
    });

    expect(handle).not.toBeNull();
    const result = await handle!.result;
    expect(result?.outcome).toBe("completed");
    expect(tracerEl.setAttribute).toHaveBeenCalledWith("cx", "240");
    expect(tracerEl.setAttribute).toHaveBeenCalledWith("cy", "80");
    expect(tracerAttrs.opacity).toBe("0");
  });
});

import { describe, expect, it } from "vitest";

import { createAnimationIntent } from "@/core/visualization/motion/animation-intent";
import { GsapMotionEngine } from "@/features/visualizer/motion/gsap-motion-engine";
import {
  buildTreeStepTimeline,
  type PositionedTreeNode,
} from "@/features/visualizer/motion/presets/tree-presets";

describe("Phase 6 tree structural transition and edge attachment", () => {
  it("keeps edge endpoints locked to moving node coordinates on every update and settle", async () => {
    const nodeAttrs = new Map<string, Record<string, string>>();
    const makeEl = (id: string) => {
      const attrs: Record<string, string> = {};
      nodeAttrs.set(id, attrs);
      return {
        style: { willChange: "" },
        opacity: 1,
        scale: 1,
        transformOrigin: "center center",
        setAttribute: (k: string, v: string) => {
          attrs[k] = v;
        },
      } as unknown as SVGElement;
    };

    const elements = new Map<string, Element>([
      ["tree-node-50", makeEl("tree-node-50")],
      ["tree-node-30", makeEl("tree-node-30")],
      ["tree-node-20", makeEl("tree-node-20")],
      ["tree-edge:tree-node-50->tree-node-30", makeEl("tree-edge:tree-node-50->tree-node-30")],
      ["tree-edge:tree-node-30->tree-node-20", makeEl("tree-edge:tree-node-30->tree-node-20")],
    ]);

    const prevNodes: PositionedTreeNode[] = [
      { id: "tree-node-50", leftId: "tree-node-30", x: 450, y: 70 },
      { id: "tree-node-30", leftId: "tree-node-20", x: 225, y: 200 },
    ];
    const nextNodes: PositionedTreeNode[] = [
      { id: "tree-node-50", leftId: "tree-node-30", x: 600, y: 70 },
      { id: "tree-node-30", leftId: "tree-node-20", x: 350, y: 200 },
      { id: "tree-node-20", x: 150, y: 330 },
    ];

    const intent = createAnimationIntent({ stepIndex: 2, type: "INSERT", payload: { value: 20 } }, [
      "tree-node-20",
    ]);
    const engine = new GsapMotionEngine({ speed: 4 });
    const handle = buildTreeStepTimeline({
      engine,
      intent,
      prevNodes,
      nextNodes,
      elements,
      generation: 1,
    });

    expect(handle).not.toBeNull();
    const res = await handle!.result;
    expect(res?.outcome).toBe("completed");

    // Verify settled node transforms and connected edge coordinates match canonical layout
    expect(nodeAttrs.get("tree-node-50")?.transform).toBe("translate(600 70)");
    expect(nodeAttrs.get("tree-node-30")?.transform).toBe("translate(350 200)");
    expect(nodeAttrs.get("tree-edge:tree-node-50->tree-node-30")).toMatchObject({
      x1: "600",
      y1: "95",
      x2: "350",
      y2: "175",
    });
    expect(nodeAttrs.get("tree-edge:tree-node-30->tree-node-20")).toMatchObject({
      x1: "350",
      y1: "225",
      x2: "150",
      y2: "305",
    });
  });
});

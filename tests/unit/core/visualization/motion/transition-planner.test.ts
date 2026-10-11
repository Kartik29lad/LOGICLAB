import { describe, expect, it } from "vitest";

import { planPositionTransition } from "@/core/visualization/motion/transition-planner";

describe("position transition planner", () => {
  it("creates stable movement operations for targeted elements", () => {
    const plan = planPositionTransition(
      {
        id: "intent-1-swap",
        type: "SWAP",
        targetIds: ["array-0", "array-1"],
        durationMs: 320,
        easing: "ease-in-out",
        execution: "parallel",
        interruptible: true,
        reducedMotion: "settle",
      },
      [
        { id: "array-0", x: 0, y: 0 },
        { id: "array-1", x: 100, y: 0 },
      ],
      [
        { id: "array-0", x: 100, y: 0 },
        { id: "array-1", x: 0, y: 0 },
      ]
    );

    expect(plan.operations).toHaveLength(2);
    expect(plan.operations[0]).toMatchObject({
      targetId: "array-0",
      property: "transform",
      from: "translate3d(-100px, 0px, 0)",
      to: "translate3d(0, 0, 0)",
    });
  });
});

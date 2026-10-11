import { describe, expect, it } from "vitest";

import { createAnimationIntent, planPositionTransition } from "@/core/visualization/motion";

describe("visualization motion architecture", () => {
  it("maps execution events to semantic animation intents", () => {
    const intent = createAnimationIntent(
      { stepIndex: 4, type: "SWAP", payload: { indexes: [0, 1] } },
      ["array-0", "array-1"]
    );
    expect(intent).toMatchObject({
      type: "SWAP",
      targetIds: ["array-0", "array-1"],
      execution: "parallel",
    });
  });

  it("plans movement from stable identity positions", () => {
    const intent = createAnimationIntent({ stepIndex: 1, type: "SWAP", payload: null }, [
      "array-0",
      "array-1",
    ]);
    expect(intent).not.toBeNull();
    const plan = planPositionTransition(
      intent!,
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
    expect(plan.operations[0]?.property).toBe("transform");
  });
});

import { describe, expect, it } from "vitest";

import { animationDuration, createAnimationIntent } from "@/core/visualization/motion";

const event = {
  type: "SWAP",
  stepIndex: 2,
  description: "Swap candidates",
  payload: { indexes: [0, 1] },
} as never;

describe("motion polish", () => {
  it("uses deliberate event-specific durations", () => {
    expect(animationDuration("SWAP")).toBeGreaterThan(animationDuration("COMPARE"));
    expect(animationDuration("FOUND")).toBeGreaterThan(animationDuration("VISIT"));
  });

  it("records semantic targets in animation metadata", () => {
    const intent = createAnimationIntent(event, ["array-0", "array-1"]);
    expect(intent?.metadata).toMatchObject({
      eventType: "SWAP",
      semanticTargets: ["array-0", "array-1"],
    });
  });
});

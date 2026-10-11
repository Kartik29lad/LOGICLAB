import { describe, expect, it } from "vitest";

import {
  resolveAnimationIntent,
  resolveTargetIds,
} from "@/core/visualization/motion/animation-intent";

describe("animation intent resolver", () => {
  it("maps execution events to semantic intents outside renderers", () => {
    expect(
      resolveAnimationIntent({ stepIndex: 3, type: "SWAP", payload: { indexes: [1, 4] } })
    ).toMatchObject({
      type: "SWAP",
      execution: "parallel",
      targetIds: ["array-1", "array-4"],
    });
  });

  it("supports graph references and node payloads", () => {
    const event = {
      stepIndex: 5,
      type: "VISIT" as const,
      payload: { node: "C" },
      references: [{ entityType: "node" as const, id: "C" }],
    };
    expect(resolveTargetIds(event)).toEqual(["C"]);
    expect(resolveAnimationIntent(event)).toMatchObject({ type: "VISIT", targetIds: ["C"] });
  });

  it("covers structural and completion events", () => {
    expect(resolveAnimationIntent({ stepIndex: 1, type: "PARTITION" })).toMatchObject({
      type: "BOUNDARY",
    });
    expect(resolveAnimationIntent({ stepIndex: 2, type: "ROTATE" })).toMatchObject({
      type: "ROTATE",
    });
    expect(resolveAnimationIntent({ stepIndex: 3, type: "COMPLETE" })).toMatchObject({
      type: "SORTED",
    });
  });
});

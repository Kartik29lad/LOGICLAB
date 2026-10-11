import { describe, expect, it } from "vitest";

import {
  describeExecutionStep,
  getInteractiveStateLabel,
} from "@/features/visualizer/accessibility";

describe("visualizer accessibility", () => {
  it("creates a useful live execution announcement", () => {
    const state = describeExecutionStep(
      "Bubble Sort",
      1,
      10,
      "COMPARE",
      "Compare two adjacent values."
    );
    expect(state.liveAnnouncement).toContain("Step 2 of 10");
    expect(state.liveAnnouncement).toContain("Compare two adjacent values.");
  });
  it("exposes state without relying on color", () => {
    expect(getInteractiveStateLabel("Node A", "current")).toBe("Node A, state: current");
  });
});

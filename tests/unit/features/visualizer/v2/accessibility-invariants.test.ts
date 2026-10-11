import { describe, expect, it } from "vitest";

import { describeExecutionStep } from "@/features/visualizer/accessibility";
import { validateVisualizerAccessibility } from "@/features/visualizer/quality-gates";

describe("V2-64 accessibility invariants", () => {
  it("describes a bounded execution step", () => {
    const state = describeExecutionStep("Bubble Sort", 4, 5, "COMPARE", "Compare adjacent values");
    expect(state.role).toBe("region");
    expect(state.label).toContain("Bubble Sort");
    expect(state.liveAnnouncement).toContain("Step 5 of 5");
  });

  it("requires role, label, live region and keyboard guidance", () => {
    expect(
      validateVisualizerAccessibility({
        role: "region",
        label: "Lab",
        liveRegion: true,
        keyboardHint: "Use arrows",
      }).every((item) => item.valid)
    ).toBe(true);
    expect(
      validateVisualizerAccessibility({
        role: "region",
        label: "",
        liveRegion: false,
        keyboardHint: "",
      }).filter((item) => !item.valid)
    ).toHaveLength(3);
  });
});

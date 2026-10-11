import { describe, expect, it } from "vitest";

import { getVisualFeedback } from "@/features/visualizer/visual-feedback";

describe("visual feedback", () => {
  it("maps meaningful events to semantic feedback", () => {
    expect(getVisualFeedback("SWAP")).toMatchObject({ label: "Swapping", tone: "info" });
    expect(getVisualFeedback("FOUND")).toMatchObject({ label: "Found", tone: "success" });
    expect(getVisualFeedback("NOT_FOUND")).toMatchObject({ tone: "warning" });
  });
  it("has a safe fallback for events without custom feedback", () => {
    expect(getVisualFeedback("START").message).toContain("canonical execution state");
  });
});

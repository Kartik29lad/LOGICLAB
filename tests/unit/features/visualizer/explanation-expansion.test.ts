import { describe, expect, it } from "vitest";

import {
  createExplanationExpansion,
  explanationSourceLabel,
} from "@/features/visualizer/explanation-expansion";

describe("explanation expansion", () => {
  it("keeps short explanations compact", () => {
    const result = createExplanationExpansion("Compare 7 and 3.");
    expect(result.expandable).toBe(false);
    expect(result.preview).toBe(result.full);
  });

  it("creates a readable preview for long explanations", () => {
    const text =
      "This is a deliberately long explanation that should be shortened for the primary visualizer surface while preserving the complete reasoning for expansion.";
    const result = createExplanationExpansion(text, 70);
    expect(result.expandable).toBe(true);
    expect(result.full).toBe(text);
    expect(result.preview.endsWith("…")).toBe(true);
    expect(result.preview.length).toBeLessThan(text.length);
  });

  it("labels explanation provenance explicitly", () => {
    expect(explanationSourceLabel("combined")).toBe("Trace + learning content");
    expect(explanationSourceLabel("insufficient-data")).toBe("Limited trace evidence");
  });
});

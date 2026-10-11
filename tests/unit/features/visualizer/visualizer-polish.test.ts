import { describe, expect, it } from "vitest";

import {
  getEducationalCue,
  getVisualizerPolishProfile,
  validateVisualLanguageConsistency,
} from "@/features/visualizer/visualizer-polish";

describe("visualizer polish", () => {
  it("switches to focused density without changing semantic behavior", () => {
    expect(getVisualizerPolishProfile(false, false)).toEqual({
      density: "comfortable",
      motionClass: "motion-rich",
      emphasisClass: "emphasis-standard",
    });
    expect(getVisualizerPolishProfile(true, true)).toEqual({
      density: "focused",
      motionClass: "motion-settle",
      emphasisClass: "emphasis-focused",
    });
  });

  it("provides educational cues for meaningful execution events", () => {
    expect(getEducationalCue("SWAP")?.state).toBe("swapping");
    expect(getEducationalCue("RELAX")?.title).toBe("Relax");
    expect(getEducationalCue("FOUND")?.state).toBe("success");
  });

  it("keeps algorithm rules aligned with the shared semantic language", () => {
    expect(validateVisualLanguageConsistency()).toEqual([]);
  });
});

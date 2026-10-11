import { describe, expect, it } from "vitest";

import {
  clampInteractionIndex,
  guardPlaybackInteraction,
  shouldHandleVisualizerShortcut,
} from "@/features/visualizer/interaction-safety";

describe("V2 interaction contracts", () => {
  it("keeps interaction indexes inside the trace range", () => {
    expect(clampInteractionIndex(-20, 4)).toBe(0);
    expect(clampInteractionIndex(99, 4)).toBe(3);
    expect(clampInteractionIndex(2.8, 4)).toBe(2);
  });

  it("prevents manual stepping during automatic playback", () => {
    expect(guardPlaybackInteraction("next", "PLAYING", 10)).toEqual({
      allowed: false,
      reason: "Pause playback before manually stepping.",
    });
    expect(guardPlaybackInteraction("next", "PAUSED", 10).allowed).toBe(true);
  });

  it("does not consume keyboard shortcuts in editable controls", () => {
    expect(shouldHandleVisualizerShortcut(null)).toBe(true);
  });
});

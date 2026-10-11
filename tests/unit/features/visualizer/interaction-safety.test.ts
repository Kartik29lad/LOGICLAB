import { describe, expect, it } from "vitest";

import {
  clampInteractionIndex,
  guardPlaybackInteraction,
} from "@/features/visualizer/interaction-safety";

describe("interaction safety", () => {
  it("clamps step indexes", () => expect(clampInteractionIndex(99, 4)).toBe(3));
  it("blocks manual next while playing", () =>
    expect(guardPlaybackInteraction("next", "PLAYING", 10).allowed).toBe(false));
  it("blocks controls without a trace", () =>
    expect(guardPlaybackInteraction("play", "READY", 0).allowed).toBe(false));
});

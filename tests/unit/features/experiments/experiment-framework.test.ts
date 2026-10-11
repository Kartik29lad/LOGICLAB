import { describe, expect, it } from "vitest";

import {
  createExperimentSnapshot,
  createReproducibilityKey,
} from "@/features/experiments/experiment-framework";

describe("experiment framework", () => {
  it("creates a stable snapshot and reproducibility key", () => {
    const snapshot = createExperimentSnapshot({
      title: "Demo",
      algorithmSlugs: ["bubble-sort", "merge-sort"],
      input: [3, 1, 2],
      seed: 42,
    });
    expect(createReproducibilityKey(snapshot)).toBe(createReproducibilityKey(snapshot));
    expect(snapshot.configuration).toEqual({});
  });

  it("does not reuse the caller's algorithm array", () => {
    const algorithms = ["bubble-sort", "merge-sort"];
    const snapshot = createExperimentSnapshot({
      title: "Demo",
      algorithmSlugs: algorithms,
      input: [1],
      seed: 1,
    });
    algorithms.push("quick-sort");
    expect(snapshot.algorithmSlugs).toEqual(["bubble-sort", "merge-sort"]);
  });
});

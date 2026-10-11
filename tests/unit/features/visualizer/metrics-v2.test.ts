import { describe, expect, it } from "vitest";

import {
  metricDelta,
  metricFocus,
  metricProgress,
  zeroMetrics,
} from "@/features/visualizer/metrics-v2";

describe("visualizer metrics v2", () => {
  it("derives a step delta without mutating snapshots", () => {
    const previous = { ...zeroMetrics(), comparisons: 2, iterations: 3 };
    const current = { ...zeroMetrics(), comparisons: 3, swaps: 1, iterations: 4 };
    expect(metricDelta(previous, current)).toMatchObject({
      comparisons: 1,
      swaps: 1,
      iterations: 1,
    });
    expect(previous.comparisons).toBe(2);
  });

  it("reports trace progress from authoritative event counts", () => {
    const current = { ...zeroMetrics(), iterations: 5 };
    const total = { ...zeroMetrics(), iterations: 10 };
    expect(metricProgress(current, total)).toBe(0.5);
  });

  it("focuses the metric associated with the current event", () => {
    const delta = { ...zeroMetrics(), swaps: 1, iterations: 1 };
    expect(metricFocus("SWAP", delta)).toBe("swaps");
    expect(metricFocus("COMPARE", { ...zeroMetrics(), iterations: 1 })).toBeUndefined();
  });
});

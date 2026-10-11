import { describe, expect, it } from "vitest";

import { runAlgorithm, runComparison } from "@/server/services/experiments/execution-service";

describe("experiment execution", () => {
  it("executes multiple algorithms against the same input", () => {
    const results = runComparison(["bubble-sort", "merge-sort"], [5, 1, 4, 2]);
    expect(results).toHaveLength(2);
    expect(results.every((item) => item.metrics.steps > 0)).toBe(true);
  });
  it("rejects duplicate or unsupported input through the comparison boundary", () => {
    expect(() => runComparison(["bubble-sort"], [1, 2])).toThrow();
    expect(() => runAlgorithm("unknown", [1, 2])).toThrow();
  });
});

import { describe, expect, it } from "vitest";

import type { ComparisonMetrics } from "@/core/comparison";

describe("comparison contracts", () => {
  it("represents execution metrics independently of UI", () => {
    const metrics: ComparisonMetrics = { steps: 4, durationMs: 1.2 };
    expect(metrics.steps).toBe(4);
  });
});

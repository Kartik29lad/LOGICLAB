import { describe, expect, it } from "vitest";

import { validatePerformanceBudget } from "@/features/visualizer/quality-gates";

describe("V2-67 performance budgets", () => {
  const budgets = { maxRenderItems: 500, maxTimelineMarkers: 180, maxTraceSteps: 5000 };

  it("accepts measurements within budgets", () => {
    expect(
      validatePerformanceBudget(
        { renderItems: 200, timelineMarkers: 100, traceSteps: 1000 },
        budgets
      )
    ).toEqual({ valid: true, violations: [] });
  });

  it("reports each exceeded budget", () => {
    expect(
      validatePerformanceBudget(
        { renderItems: 501, timelineMarkers: 181, traceSteps: 5001 },
        budgets
      )
    ).toEqual({ valid: false, violations: ["render-items", "timeline-markers", "trace-steps"] });
  });
});

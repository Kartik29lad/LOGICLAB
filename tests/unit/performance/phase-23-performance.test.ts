import { describe, expect, it } from "vitest";

import { exceedsPerformanceBudget, PERFORMANCE_BUDGETS } from "@/lib/performance-budgets";

describe("Phase 23 performance budgets", () => {
  it("defines bounded public route, API, and visualizer budgets", () => {
    expect(PERFORMANCE_BUDGETS.publicRouteServerMs).toBe(500);
    expect(PERFORMANCE_BUDGETS.publicApiServerMs).toBe(300);
    expect(PERFORMANCE_BUDGETS.visualizerTraceStartupMs).toBe(250);
    expect(PERFORMANCE_BUDGETS.visualizerTraceEvents).toBe(2000);
    expect(PERFORMANCE_BUDGETS.visualizerInputItems).toBe(5000);
  });

  it("detects budget violations without mutating budget definitions", () => {
    expect(exceedsPerformanceBudget("publicApiServerMs", 301)).toBe(true);
    expect(exceedsPerformanceBudget("publicApiServerMs", 300)).toBe(false);
    expect(Object.isFrozen(PERFORMANCE_BUDGETS)).toBe(true);
  });
});

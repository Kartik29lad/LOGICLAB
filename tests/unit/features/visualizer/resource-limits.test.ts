import { describe, expect, it } from "vitest";

import {
  validateCollectionSize,
  validateTraceBudget,
  VISUALIZER_RESOURCE_LIMITS,
} from "@/features/visualizer/resource-limits";

describe("visualizer resource limits", () => {
  it("accepts trace at the configured limit", () =>
    expect(validateTraceBudget(VISUALIZER_RESOURCE_LIMITS.traceSteps).valid).toBe(true));
  it("rejects oversized traces", () =>
    expect(validateTraceBudget(VISUALIZER_RESOURCE_LIMITS.traceSteps + 1).valid).toBe(false));
  it("validates collection sizes", () =>
    expect(validateCollectionSize("array", 101).valid).toBe(false));
});

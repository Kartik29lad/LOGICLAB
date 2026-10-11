import { describe, expect, it } from "vitest";

import { shouldUseExecutionWorker } from "@/features/visualizer/worker-policy";

describe("visualizer worker policy", () => {
  it("keeps normal executions on the main thread", () =>
    expect(shouldUseExecutionWorker({ estimatedSteps: 20, inputSize: 100 })).toBe(false));
  it("promotes measured heavy executions", () =>
    expect(shouldUseExecutionWorker({ estimatedSteps: 2_000, inputSize: 100 })).toBe(true));
});

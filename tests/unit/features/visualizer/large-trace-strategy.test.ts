import { describe, expect, it } from "vitest";

import { getTraceWindow, shouldVirtualizeTrace } from "@/features/visualizer/large-trace-strategy";

describe("large trace strategy", () => {
  it("keeps small traces intact", () => {
    const steps = Array.from({ length: 5 }, (_, stepIndex) => ({ stepIndex })) as never[];
    expect(getTraceWindow(steps, 2).grouped).toBe(false);
  });
  it("virtualizes large traces around the current step", () => {
    expect(shouldVirtualizeTrace(1000)).toBe(true);
    const steps = Array.from({ length: 1000 }, (_, stepIndex) => ({ stepIndex })) as never[];
    const result = getTraceWindow(steps, 500);
    expect(result.grouped).toBe(true);
    expect(result.steps.length).toBeLessThan(1000);
  });
});

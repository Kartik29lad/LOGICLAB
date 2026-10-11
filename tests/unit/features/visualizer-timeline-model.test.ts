import { describe, expect, it } from "vitest";

import {
  buildTimelineModel,
  isMarkedEvent,
  timelineProgress,
} from "@/features/visualizer/timeline-model";

function steps(count: number) {
  return Array.from({ length: count }, (_, stepIndex) => ({
    stepIndex,
    event: { type: stepIndex % 2 === 0 ? "COMPARE" : "READ", description: "test" },
  })) as never[];
}

describe("timeline model", () => {
  it("keeps normal traces one marker per execution step", () => {
    const model = buildTimelineModel(steps(12), 4);
    expect(model.isDense).toBe(false);
    expect(model.bucketSize).toBe(1);
    expect(model.buckets).toHaveLength(12);
    expect(model.buckets[4]?.containsCurrent).toBe(true);
  });

  it("groups large traces without dropping their step range", () => {
    const model = buildTimelineModel(steps(500), 241);
    expect(model.isDense).toBe(true);
    expect(model.buckets.length).toBeLessThanOrEqual(120);
    expect(model.buckets[0]?.startStep).toBe(0);
    expect(model.buckets.at(-1)?.endStep).toBe(499);
    expect(model.buckets.some((bucket) => bucket.containsCurrent)).toBe(true);
  });

  it("recognizes semantic operation events", () => {
    expect(isMarkedEvent("SWAP")).toBe(true);
    expect(isMarkedEvent("READ")).toBe(false);
  });

  it("clamps progress", () => {
    expect(timelineProgress(-2, 10)).toBe(0);
    expect(timelineProgress(4, 10)).toBeCloseTo(4 / 9);
    expect(timelineProgress(20, 10)).toBe(1);
  });
});

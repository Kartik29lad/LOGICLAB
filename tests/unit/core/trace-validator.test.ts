import { describe, expect, it } from "vitest";

import type { AlgorithmTrace } from "../../../src/contracts/events/trace-events";
import { buildBinarySearchSteps } from "../../../src/core/algorithms/implementations/searching/binary-search/binary-search.steps";
import { buildLinearSearchSteps } from "../../../src/core/algorithms/implementations/searching/linear-search/linear-search.steps";
import { buildBubbleSortSteps } from "../../../src/core/algorithms/implementations/sorting/bubble-sort/bubble-sort.steps";
import { buildInsertionSortSteps } from "../../../src/core/algorithms/implementations/sorting/insertion-sort/insertion-sort.steps";
import { buildSelectionSortSteps } from "../../../src/core/algorithms/implementations/sorting/selection-sort/selection-sort.steps";
import { TraceValidator } from "../../../src/core/visualization/validation/trace-validator";

describe("Phase 7: Trace Invariant Validation", () => {
  it("validates that all sorting and searching algorithm step builders satisfy trace invariants", () => {
    const traces: AlgorithmTrace[] = [
      buildBubbleSortSteps([5, 2, 8, 1]),
      buildSelectionSortSteps([9, 4, 1, 7]),
      buildInsertionSortSteps([12, 3, 5, 2]),
      buildBinarySearchSteps([1, 3, 5, 7, 9], 7),
      buildLinearSearchSteps([8, 2, 4, 6], 4),
    ];

    for (const trace of traces) {
      const result = TraceValidator.validate(trace);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    }
  });

  it("detects step index ordering violations", () => {
    const trace = buildBubbleSortSteps([3, 2, 1]);
    // Introduce ordering defect
    trace.steps[1]!.stepIndex = 99;

    const result = TraceValidator.validate(trace);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("Step ordering violation"))).toBe(true);
  });

  it("detects out-of-bounds highlight index references", () => {
    const trace = buildBubbleSortSteps([3, 2, 1]);
    trace.steps[0]!.highlights.push({ indices: [100], colorRole: "comparison" });

    const result = TraceValidator.validate(trace);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("out of bounds"))).toBe(true);
  });

  it("detects unrecognized step action types", () => {
    const trace = buildBubbleSortSteps([3, 2, 1]);
    (trace.steps[0] as { action: string }).action = "teleport";

    const result = TraceValidator.validate(trace);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("Invalid step action"))).toBe(true);
  });

  it("detects final state mismatch with algorithm output", () => {
    const trace = buildBubbleSortSteps([3, 2, 1]);
    trace.output = [99, 99, 99]; // Deliberate mismatch

    const result = TraceValidator.validate(trace);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("does not match algorithm output"))).toBe(true);
  });

  it("detects pointer index references out of bounds", () => {
    const trace = buildBubbleSortSteps([3, 2, 1]);
    trace.steps[0]!.pointers.push({ name: "ptr", index: 99 });

    const result = TraceValidator.validate(trace);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("out of bounds"))).toBe(true);
  });

  it("detects illegal transition after a complete step", () => {
    const trace = buildBubbleSortSteps([3, 2, 1]);
    const completeStep = trace.steps[trace.steps.length - 1]!;
    // Add extra step after complete
    trace.steps.push({
      ...completeStep,
      stepIndex: trace.steps.length,
      action: "compare",
    });

    const result = TraceValidator.validate(trace);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('occurs after a "complete" step'))).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import { buildBinarySearchSteps } from "../../../src/core/algorithms/implementations/searching/binary-search/binary-search.steps";
import { buildLinearSearchSteps } from "../../../src/core/algorithms/implementations/searching/linear-search/linear-search.steps";
import { buildBubbleSortSteps } from "../../../src/core/algorithms/implementations/sorting/bubble-sort/bubble-sort.steps";
import { buildInsertionSortSteps } from "../../../src/core/algorithms/implementations/sorting/insertion-sort/insertion-sort.steps";
import { buildSelectionSortSteps } from "../../../src/core/algorithms/implementations/sorting/selection-sort/selection-sort.steps";
import { ExecutionEngine } from "../../../src/core/execution/execution-engine";

describe("Phase 6: Algorithm Step Builders & Execution Engine", () => {
  it("builds granular trace steps for Bubble Sort with highlights and pointers", () => {
    const trace = buildBubbleSortSteps([5, 2, 8]);
    expect(trace.steps.length).toBeGreaterThan(0);
    expect(trace.completed).toBe(true);
    expect(trace.output).toEqual([2, 5, 8]);

    const compareStep = trace.steps.find((s) => s.action === "compare");
    expect(compareStep).toBeDefined();
    expect(compareStep?.highlights.length).toBeGreaterThan(0);
    expect(compareStep?.pointers.length).toBeGreaterThan(0);

    const swapStep = trace.steps.find((s) => s.action === "swap");
    expect(swapStep).toBeDefined();

    const completeStep = trace.steps[trace.steps.length - 1];
    expect(completeStep?.action).toBe("complete");
    expect(completeStep?.stateSnapshot).toEqual([2, 5, 8]);
  });

  it("builds granular trace steps for Selection Sort", () => {
    const trace = buildSelectionSortSteps([64, 25, 12]);
    expect(trace.completed).toBe(true);
    expect(trace.output).toEqual([12, 25, 64]);
    expect(trace.steps.some((s) => s.action === "select")).toBe(true);
  });

  it("builds granular trace steps for Insertion Sort", () => {
    const trace = buildInsertionSortSteps([12, 11, 13]);
    expect(trace.completed).toBe(true);
    expect(trace.output).toEqual([11, 12, 13]);
    expect(trace.steps.some((s) => s.action === "insert")).toBe(true);
  });

  it("builds trace steps for Binary Search when element is present", () => {
    const trace = buildBinarySearchSteps([10, 20, 30, 40, 50], 30);
    expect(trace.output).toBe(2);
    expect(trace.completed).toBe(true);

    const matchStep = trace.steps.find((s) => s.action === "complete");
    expect(matchStep?.description).toContain("Target 30 found");
  });

  it("builds trace steps for Linear Search", () => {
    const trace = buildLinearSearchSteps([7, 3, 9], 3);
    expect(trace.output).toBe(1);
    expect(trace.completed).toBe(true);
  });

  it("ExecutionEngine runs algorithms from raw string input and returns controller", () => {
    const controller = ExecutionEngine.execute("bubble-sort", "9, 3, 5, 1");
    expect(controller.getStatus()).toBe("INITIALIZED");
    expect(controller.getTotalSteps()).toBeGreaterThan(0);

    const finalStep = controller.trace.steps[controller.getTotalSteps() - 1];
    expect(finalStep?.stateSnapshot).toEqual([1, 3, 5, 9]);
  });

  it("ExecutionEngine rejects invalid inputs with descriptive error", () => {
    expect(() => ExecutionEngine.execute("bubble-sort", "abc, def")).toThrow(
      /Input parsing failed/
    );
    expect(() => ExecutionEngine.execute("bubble-sort", [1])).toThrow(/below minimum limit/);
  });
});

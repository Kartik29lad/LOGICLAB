import { describe, expect, it } from "vitest";

import { buildBubbleSortSteps } from "../../../src/core/algorithms/implementations/sorting/bubble-sort/bubble-sort.steps";
import { VisualizationTransformer } from "../../../src/core/visualization/transformer/visualization-transformer";

describe("Phase 7: Visualization Transformer", () => {
  it("transforms an execution step into a normalized visual frame", () => {
    const trace = buildBubbleSortSteps([4, 2, 7]);
    const firstStep = trace.steps[0]!;

    const frame = VisualizationTransformer.transformStep(firstStep, trace.totalSteps, trace.input);

    expect(frame.stepIndex).toBe(0);
    expect(frame.totalSteps).toBe(trace.totalSteps);
    expect(frame.description).toBe(firstStep.description);
    expect(frame.action).toBe(firstStep.action);
    expect(frame.status).toBe("running");
    expect(frame.isCompleted).toBe(false);
    expect(frame.snapshot.type).toBe("array");
    expect(frame.arrayState).toBeDefined();
    expect(frame.metrics).toEqual(firstStep.metrics);
  });

  it("marks final step as completed with completed status", () => {
    const trace = buildBubbleSortSteps([3, 1]);
    const lastStep = trace.steps[trace.steps.length - 1]!;

    const frame = VisualizationTransformer.transformStep(lastStep, trace.totalSteps, trace.input);

    expect(frame.isCompleted).toBe(true);
    expect(frame.status).toBe("completed");
  });

  it("extracts active elements and active pointers accurately", () => {
    const trace = buildBubbleSortSteps([5, 1, 9]);
    const compareStep = trace.steps.find((s) => s.action === "compare")!;

    const frame = VisualizationTransformer.transformStep(
      compareStep,
      trace.totalSteps,
      trace.input
    );

    expect(frame.activeElements.length).toBeGreaterThan(0);
    expect(Object.keys(frame.activePointers)).toContain("j");
    expect(frame.highlightedElements).toHaveLength(compareStep.highlights.length);
  });

  it("transforms an entire trace into an array of frames", () => {
    const trace = buildBubbleSortSteps([3, 2, 1]);
    const frames = VisualizationTransformer.transformTrace(trace);

    expect(frames).toHaveLength(trace.steps.length);
    expect(frames[0]!.stepIndex).toBe(0);
    expect(frames[frames.length - 1]!.isCompleted).toBe(true);
  });

  it("guarantees immutability so renderer mutations do not affect the trace", () => {
    const trace = buildBubbleSortSteps([10, 5]);
    const originalSnapshotVal = (trace.steps[0]!.stateSnapshot as number[])[0];

    const frame = VisualizationTransformer.transformStep(
      trace.steps[0]!,
      trace.totalSteps,
      trace.input
    );

    // Mutate the frame snapshot
    if (frame.snapshot.type === "array" && frame.snapshot.elements[0]) {
      frame.snapshot.elements[0].value = 9999;
    }

    // Source trace must remain untouched
    expect((trace.steps[0]!.stateSnapshot as number[])[0]).toBe(originalSnapshotVal);
  });
});

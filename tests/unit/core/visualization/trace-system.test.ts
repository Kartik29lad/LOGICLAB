import { describe, expect, it } from "vitest";

import type {
  CanonicalExecutionEvent,
  CanonicalExecutionTrace,
} from "../../../../src/contracts/events/trace-events";
import { canonicalizeExecutionResult } from "../../../../src/core/visualization/trace/canonical-trace";
import { TraceBuilder } from "../../../../src/core/visualization/trace/trace-builder";
import { TraceValidationError } from "../../../../src/core/visualization/trace/trace-errors";
import { validateTraceInvariants } from "../../../../src/core/visualization/trace/trace-invariants";
import { validateMetricsAgainstEvents } from "../../../../src/core/visualization/trace/trace-metrics";
import { validateExecutionTrace } from "../../../../src/core/visualization/trace/trace-validator";

const metrics = {
  comparisons: 1,
  swaps: 0,
  reads: 0,
  writes: 0,
  visits: 0,
  iterations: 1,
  elapsedMs: 1,
};

function event(
  stepIndex: number,
  before: number[],
  after: number[]
): CanonicalExecutionEvent<number[]> {
  return { stepIndex, type: "COMPARE", stateBefore: before, stateAfter: after };
}

describe("Phase 7 trace system", () => {
  it("builds ordered state transitions with immutable snapshots", () => {
    const builder = new TraceBuilder("e1", "demo", [2, 1], [2, 1]);
    const before = [2, 1];
    builder.append(event(0, before, [2, 1]));
    before[0] = 99;
    const trace = builder.build([1, 2], "completed", metrics);
    expect(trace.steps[0].stateBefore).toEqual([2, 1]);
    expect(trace.finalState).toEqual([2, 1]);
  });

  it("rejects missing or out-of-order steps", () => {
    const builder = new TraceBuilder<unknown, unknown, number[]>("e1", "demo", [], []);
    expect(() => builder.append(event(1, [], []))).toThrow(TraceValidationError);
  });

  it("rejects broken state continuity", () => {
    const builder = new TraceBuilder<unknown, unknown, number[]>("e1", "demo", [], []);
    builder.append(event(0, [], [1]));
    expect(() => builder.append(event(1, [2], [3]))).toThrow(TraceValidationError);
  });

  it("validates final state against the final step", () => {
    const trace: CanonicalExecutionTrace = {
      executionId: "e1",
      algorithmSlug: "demo",
      input: [],
      initialState: [],
      steps: [
        { stepIndex: 0, event: event(0, [], [1]), stateBefore: [], stateAfter: [1], metrics },
      ],
      finalState: [2],
      metrics,
      status: "completed",
    };
    expect(() => validateExecutionTrace(trace)).toThrow(TraceValidationError);
  });

  it("validates event-derived metrics", () => {
    expect(() => validateMetricsAgainstEvents([{ type: "COMPARE" }], metrics)).not.toThrow();
    expect(() =>
      validateMetricsAgainstEvents([{ type: "COMPARE" }, { type: "COMPARE" }], metrics)
    ).toThrow();
  });
  it("supports domain reference validation", () => {
    const builder = new TraceBuilder<unknown, unknown, number[]>("e1", "demo", [], []);
    builder.append({
      stepIndex: 0,
      type: "VISIT",
      references: [{ entityType: "node", id: "A" }],
      stateBefore: [],
      stateAfter: [],
    });
    const trace = builder.build(undefined, "completed", { ...metrics, visits: 1 });
    expect(() =>
      validateTraceInvariants(trace, { resolveReference: (reference) => reference.id === "A" })
    ).not.toThrow();
    expect(() => validateTraceInvariants(trace, { resolveReference: () => false })).toThrow(
      TraceValidationError
    );
  });

  it("rejects decreasing cumulative metrics", () => {
    const trace: CanonicalExecutionTrace = {
      executionId: "e1",
      algorithmSlug: "demo",
      input: [],
      initialState: [],
      steps: [
        { stepIndex: 0, event: event(0, [], [1]), stateBefore: [], stateAfter: [1], metrics },
        {
          stepIndex: 1,
          event: event(1, [1], [2]),
          stateBefore: [1],
          stateAfter: [2],
          metrics: { ...metrics, comparisons: 0 },
        },
      ],
      finalState: [2],
      metrics,
      status: "completed",
    };
    expect(() => validateExecutionTrace(trace)).toThrow(TraceValidationError);
  });

  it("canonicalizes an execution result into the Phase 7 trace model", () => {
    const result = {
      output: [1, 2],
      finalState: [1, 2],
      trace: {
        executionId: "e2",
        algorithmSlug: "sort",
        input: [2, 1],
        events: [
          { stepIndex: 0, type: "START", payload: { values: [2, 1] } },
          { stepIndex: 1, type: "COMPLETE", payload: { values: [1, 2] } },
        ],
        metrics: {
          comparisons: 0,
          swaps: 0,
          reads: 0,
          writes: 0,
          visits: 0,
          iterations: 1,
          elapsedMs: 2,
        },
        status: "completed" as const,
      },
    };
    const trace = canonicalizeExecutionResult(result, {
      initialState: [2, 1],
      resolveStateAfter: (source) => {
        const payload = source.payload as { values: number[] };
        return [...payload.values];
      },
    });
    expect(trace.steps).toHaveLength(2);
    expect(trace.finalState).toEqual([1, 2]);
    expect(trace.steps[1].event.type).toBe("COMPLETE");
  });
});

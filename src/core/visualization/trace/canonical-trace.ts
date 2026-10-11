import type {
  CanonicalExecutionEvent,
  CanonicalExecutionTrace,
  ExecutionEventType,
} from "../../../contracts/events/trace-events";
import type {
  ExecutionEvent,
  ExecutionMetrics,
  ExecutionResult,
} from "../../../contracts/execution";
import { TraceBuilder } from "./trace-builder";
import { validateMetricsAgainstEvents } from "./trace-metrics";
import { validateExecutionTrace } from "./trace-validator";

export interface CanonicalTraceOptions<TState> {
  initialState: TState;
  resolveStateAfter?: (event: ExecutionEvent, previousState: TState) => TState;
}

export function canonicalizeExecutionResult<TOutput, TState>(
  result: ExecutionResult<TOutput, TState>,
  options: CanonicalTraceOptions<TState>
): CanonicalExecutionTrace<unknown, TOutput, TState> {
  const sourceEvents = result.trace.events as ExecutionEvent[];
  const builder = new TraceBuilder<unknown, TOutput, TState>(
    result.trace.executionId,
    result.trace.algorithmSlug,
    result.trace.input,
    options.initialState
  );
  let state = structuredClone(options.initialState);
  for (const source of sourceEvents) {
    const type = normalizeEventType(source.type);
    const stateBefore = structuredClone(state);
    const stateAfter =
      source.payload && isStatePayload(source.payload)
        ? structuredClone(source.payload.stateAfter as TState)
        : (options.resolveStateAfter?.(source, state) ?? state);
    const event: CanonicalExecutionEvent<TState> = {
      stepIndex: source.stepIndex,
      type,
      payload: source.payload,
      stateBefore,
      stateAfter,
      description: source.description,
    };
    builder.append(event);
    state = structuredClone(stateAfter);
  }
  const trace = builder.build(
    result.output,
    result.trace.status,
    toTraceMetrics(result.trace.metrics)
  );
  if (
    trace.status === "completed" &&
    result.finalState !== undefined &&
    JSON.stringify(trace.finalState) !== JSON.stringify(result.finalState)
  ) {
    throw new Error("Canonical trace final state does not match algorithm final state.");
  }
  validateExecutionTrace(trace);
  validateMetricsAgainstEvents(
    trace.steps.map((step) => step.event),
    trace.metrics
  );
  return trace;
}

function normalizeEventType(type: string): ExecutionEventType {
  const normalized = type.toUpperCase() as ExecutionEventType;
  const allowed = new Set<string>([
    "START",
    "COMPARE",
    "SWAP",
    "WRITE",
    "READ",
    "INSERT",
    "REMOVE",
    "VISIT",
    "ENQUEUE",
    "DEQUEUE",
    "PUSH",
    "POP",
    "RELAX",
    "SET_CURRENT",
    "FOUND",
    "NOT_FOUND",
    "PARTITION",
    "MERGE",
    "ROTATE",
    "MARK_SORTED",
    "SELECT",
    "PIVOT",
    "BACKTRACK",
    "COMPLETE",
  ]);
  if (!allowed.has(normalized)) throw new Error(`Unsupported execution event type: ${type}`);
  return normalized;
}

function isStatePayload(payload: unknown): payload is { stateAfter: unknown } {
  return typeof payload === "object" && payload !== null && "stateAfter" in payload;
}

function toTraceMetrics(metrics: ExecutionMetrics) {
  return {
    comparisons: metrics.comparisons,
    swaps: metrics.swaps,
    reads: metrics.reads,
    writes: metrics.writes,
    visits: metrics.visits,
    iterations: metrics.iterations,
    elapsedMs: metrics.elapsedMs,
  };
}

import type { CanonicalExecutionEvent } from "../../../contracts/events/trace-events";
import type { ExecutionMetrics } from "../../../contracts/execution";
import { TraceBuilder } from "./trace-builder";

export function createTraceBuilder<TInput, TOutput, TState>(
  executionId: string,
  algorithmSlug: string,
  input: TInput,
  initialState: TState
): TraceBuilder<TInput, TOutput, TState> {
  return new TraceBuilder<TInput, TOutput, TState>(executionId, algorithmSlug, input, initialState);
}

export function metricsToTraceMetrics(metrics: ExecutionMetrics): ExecutionMetrics {
  return { ...metrics };
}

export type TraceEvent<TState = unknown, TPayload = unknown> = CanonicalExecutionEvent<
  TState,
  TPayload
>;

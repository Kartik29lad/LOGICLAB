/**
 * Canonical execution contracts for the LogicLab application boundary.
 *
 * These contracts are framework-independent. They deliberately contain no
 * React, Next.js, database, or visualization dependencies.
 */

export type ExecutionLifecycleStatus =
  | "created"
  | "validated"
  | "initialized"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export interface ExecutionLimits {
  maxSteps: number;
  maxRuntimeMs: number;
  maxInputSize?: number;
  maxTraceEvents?: number;
  maxGraphNodes?: number;
  maxGraphEdges?: number;
  maxOperations?: number;
  maxStringLength?: number;
  /** Reserved for worker-backed execution; Phase 6 does not enforce memory. */
  maxWorkerMemoryMb?: number;
}

export type ExecutionMetricName =
  "comparisons" | "swaps" | "reads" | "writes" | "visits" | "iterations";

export interface ExecutionMetrics {
  comparisons: number;
  swaps: number;
  reads: number;
  writes: number;
  visits: number;
  iterations: number;
  elapsedMs: number;
  [key: string]: number;
}

export interface ExecutionMetricsReporter {
  increment(metric: ExecutionMetricName, amount?: number): void;
  snapshot(): ExecutionMetrics;
}

export interface ExecutionCancellation {
  readonly aborted: boolean;
  readonly reason?: string;
  throwIfAborted?: () => void;
}

export interface ExecutionContext<TInput = unknown> {
  executionId: string;
  algorithmSlug: string;
  input: TInput;
  limits: ExecutionLimits;
  cancellation?: ExecutionCancellation;
  metrics?: ExecutionMetricsReporter;
  metadata?: Readonly<Record<string, string | number | boolean>>;
  checkpoint?: () => Promise<void>;
  getStatus?: () => ExecutionLifecycleStatus;
}

export interface ExecutionEvent<TPayload = unknown> {
  stepIndex: number;
  type: string;
  payload?: TPayload;
  description?: string;
}

export interface ExecutionTrace<
  TInput = unknown,
  TOutput = unknown,
  TState = unknown,
  TEvent extends ExecutionEvent = ExecutionEvent,
> {
  executionId: string;
  algorithmSlug: string;
  input: TInput;
  output?: TOutput;
  initialState?: TState;
  finalState?: TState;
  events: TEvent[];
  metrics: ExecutionMetrics;
  status: Extract<ExecutionLifecycleStatus, "completed" | "failed" | "cancelled">;
}

export interface ExecutionResult<
  TOutput = unknown,
  TState = unknown,
  TEvent extends ExecutionEvent = ExecutionEvent,
> {
  output?: TOutput;
  finalState?: TState;
  trace: ExecutionTrace<unknown, TOutput, TState, TEvent>;
}

export interface AlgorithmDefinition<
  TInput = unknown,
  TOutput = unknown,
  TState = unknown,
  TEvent extends ExecutionEvent = ExecutionEvent,
> {
  id: string;
  slug: string;
  validateInput(input: TInput): void;
  execute(
    context: ExecutionContext<TInput>,
    emit: (event: TEvent) => void
  ): Promise<ExecutionResult<TOutput, TState, TEvent>> | ExecutionResult<TOutput, TState, TEvent>;
}

export interface ExecutionController {
  start(): Promise<void>;
  pause(): void;
  resume(): void;
  restart(): Promise<void>;
  cancel(): void;
  reset(): void;
  stepForward(): void;
  getStatus(): ExecutionLifecycleStatus;
}

/** Canonical execution event and trace contracts for Phase 7. */

export const EXECUTION_EVENT_TYPES = [
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
] as const;

export type ExecutionEventType = (typeof EXECUTION_EVENT_TYPES)[number];

export interface TraceEntityReference {
  entityType:
    "array-index" | "node" | "edge" | "stack-item" | "queue-item" | "tree-node" | "generic";
  id: string | number;
}

export interface TraceCodeReference {
  codeId?: string;
  lineNumbers?: number[];
}

export interface TraceExplanationReference {
  explanationId?: string;
  text?: string;
}

export interface TraceMetricSnapshot {
  comparisons: number;
  swaps: number;
  reads: number;
  writes: number;
  visits: number;
  iterations: number;
  elapsedMs: number;
}

export interface CanonicalExecutionEvent<TState = unknown, TPayload = unknown> {
  stepIndex: number;
  type: ExecutionEventType;
  payload?: TPayload;
  stateBefore?: TState;
  stateAfter?: TState;
  references?: TraceEntityReference[];
  description?: string;
  explanation?: TraceExplanationReference;
  codeReference?: TraceCodeReference;
  pseudocodeReference?: { pseudocodeId?: string; sectionId?: string };
  metrics?: TraceMetricSnapshot;
}

export interface ExecutionTraceStep<TState = unknown, TPayload = unknown> {
  stepIndex: number;
  event: CanonicalExecutionEvent<TState, TPayload>;
  stateBefore: TState;
  stateAfter: TState;
  metrics: TraceMetricSnapshot;
}

export interface CanonicalExecutionTrace<TInput = unknown, TOutput = unknown, TState = unknown> {
  executionId: string;
  algorithmSlug: string;
  input: TInput;
  output?: TOutput;
  initialState: TState;
  steps: ExecutionTraceStep<TState>[];
  finalState: TState;
  metrics: TraceMetricSnapshot;
  status: "completed" | "failed" | "cancelled";
}

/** Backward-compatible API trace shape retained for existing consumers. */
export type StepActionType =
  | "compare"
  | "swap"
  | "visit"
  | "mark-sorted"
  | "select"
  | "pivot"
  | "insert"
  | "backtrack"
  | "complete";

export interface StepPointer {
  name: string;
  index: number | string;
  label?: string;
}

export interface StepHighlight {
  indices: (number | string)[];
  colorRole: "primary" | "secondary" | "comparison" | "sorted" | "active" | "danger";
}

export interface TraceMetrics {
  comparisons: number;
  swaps: number;
  accessCount: number;
  iterations: number;
  elapsedMs?: number;
}

export interface ExecutionStep<TState = unknown> {
  stepIndex: number;
  totalSteps?: number;
  action: StepActionType;
  description: string;
  stateSnapshot: TState;
  highlights: StepHighlight[];
  pointers: StepPointer[];
  lineNumbers?: number[];
  metrics: TraceMetrics;
}

export interface AlgorithmTrace<TInput = unknown, TOutput = unknown, TState = unknown> {
  algorithmSlug: string;
  category: "sorting" | "searching" | "graph" | "tree" | "data-structure" | "dynamic-programming";
  input: TInput;
  output: TOutput;
  steps: ExecutionStep<TState>[];
  totalSteps: number;
  finalMetrics: TraceMetrics;
  completed: boolean;
}

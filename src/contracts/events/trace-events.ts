/**
 * Trace Event Contracts for LogicLab Execution Engine
 * Specifies step snapshots, highlight actions, and metrics emitted by algorithms.
 */

export type StepActionType =
  | "compare"
  | "swap"
  | "write"
  | "read"
  | "insert"
  | "remove"
  | "visit"
  | "enqueue"
  | "dequeue"
  | "push"
  | "pop"
  | "relax"
  | "set-current"
  | "found"
  | "not-found"
  | "mark-sorted"
  | "select"
  | "pivot"
  | "backtrack"
  | "complete";

export const TRACE_EVENT_ACTIONS = {
  COMPARE: "compare",
  SWAP: "swap",
  WRITE: "write",
  READ: "read",
  INSERT: "insert",
  REMOVE: "remove",
  VISIT: "visit",
  ENQUEUE: "enqueue",
  DEQUEUE: "dequeue",
  PUSH: "push",
  POP: "pop",
  RELAX: "relax",
  SET_CURRENT: "set-current",
  FOUND: "found",
  NOT_FOUND: "not-found",
  MARK_SORTED: "mark-sorted",
  SELECT: "select",
  PIVOT: "pivot",
  BACKTRACK: "backtrack",
  COMPLETE: "complete",
} as const;

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
  category: "sorting" | "searching" | "graph" | "tree" | "dynamic-programming";
  input: TInput;
  output: TOutput;
  steps: ExecutionStep<TState>[];
  totalSteps: number;
  finalMetrics: TraceMetrics;
  completed: boolean;
}

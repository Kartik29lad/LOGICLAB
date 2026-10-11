import type { CanonicalExecutionTrace, ExecutionTraceStep } from "@/contracts/events/trace-events";
import type {
  ArrayVisualState,
  SemanticVisualState,
  VisualizationState,
} from "@/contracts/events/visualization-state";
import type { ExecutionMetrics } from "@/contracts/execution";

import { deriveHeapStepView } from "./heap-visualization";
import { toArrayVisualizationState } from "./render-state-adapters";
import { graphState } from "./render-state-graph";
import { treeStepToVisualization } from "./tree-state";

export function traceStepToVisualization(
  slug: string,
  trace: CanonicalExecutionTrace,
  step: ExecutionTraceStep,
  status: VisualizationState["status"]
): VisualizationState {
  const metrics = step.metrics as ExecutionMetrics;
  const visualization =
    slug === "bfs" || slug === "dfs" || slug === "dijkstra" || slug === "a-star"
      ? graphState(slug, step, metrics, status)
      : slug === "binary-search-tree"
        ? treeStepToVisualization(step, metrics, status)
        : slug === "stack"
          ? linearState("stack", step, metrics, status)
          : slug === "queue"
            ? linearState("queue", step, metrics, status)
            : slug === "linked-list"
              ? linearState("linked-list", step, metrics, status)
              : slug === "hash-table"
                ? hashTableState(step, metrics, status)
                : slug === "heap"
                  ? deriveHeapStepView(step, metrics, status)
                  : arrayState(trace, step, metrics, status);
  return {
    ...visualization,
    selectedAlgorithm: slug,
    input: trace.input,
    executionTraceStep: step.stepIndex,
    result: trace.output,
    status,
    visualization: visualization as never,
  };
}

function arrayState(
  trace: CanonicalExecutionTrace,
  step: ExecutionTraceStep,
  metrics: ExecutionMetrics,
  status: VisualizationState["status"]
): ArrayVisualState {
  const after = Array.isArray(step.stateAfter) ? (step.stateAfter as number[]) : [7, 3, 9, 2, 5];
  const payload = (step.event.payload ?? {}) as Record<string, unknown>;
  const indexes = Array.isArray(payload.indexes)
    ? payload.indexes.filter((x): x is number => typeof x === "number")
    : [];
  const elementIds = deriveStableElementIds(trace, step.stepIndex, after);
  const elementStates: Record<number, SemanticVisualState> = {};
  if (step.event.type === "SWAP" || step.event.type === "COMPARE")
    indexes.forEach((index) => {
      elementStates[index] = step.event.type === "SWAP" ? "swapping" : "comparing";
    });
  if (step.event.type === "WRITE")
    indexes.forEach((index) => {
      elementStates[index] = "writing";
    });
  if (step.event.type === "SELECT")
    indexes.forEach((index) => {
      elementStates[index] = "selected";
    });
  if (step.event.type === "PIVOT" && typeof payload.index === "number")
    elementStates[payload.index] = "pivot";
  if (step.event.type === "MARK_SORTED")
    indexes.forEach((index) => {
      elementStates[index] = "sorted";
    });
  const sortedIndexes =
    step.event.type === "COMPLETE"
      ? after.map((_, i) => i)
      : step.event.type === "MARK_SORTED"
        ? indexes
        : [];
  return toArrayVisualizationState(
    {
      values: after,
      elementIds,
      elementStates,
      activeIndexes: indexes,
      highlightedIndexes: indexes,
      sortedIndexes,
      pointers: typeof payload.mid === "number" ? { mid: payload.mid } : {},
    },
    step.stepIndex,
    metrics,
    status
  );
}

function deriveStableElementIds(
  trace: CanonicalExecutionTrace,
  stepIndex: number,
  values: number[]
): string[] {
  const initial = Array.isArray(trace.input) ? (trace.input as number[]) : [];
  const tokens = initial.map((value, index) => ({ id: `array-${index}`, value }));
  for (const traceStep of trace.steps.slice(0, stepIndex + 1)) {
    const payload = (traceStep.event.payload ?? {}) as Record<string, unknown>;
    const indexes = Array.isArray(payload.indexes)
      ? payload.indexes.filter((x): x is number => typeof x === "number")
      : [];
    if (traceStep.event.type === "SWAP" && indexes.length >= 2) {
      const [a, b] = indexes;
      [tokens[a], tokens[b]] = [tokens[b], tokens[a]];
    } else if (traceStep.event.type === "WRITE" && indexes.length >= 1) {
      const target = indexes[0];
      const value = values[target];
      if (typeof value === "number" && tokens[target])
        tokens[target] = { ...tokens[target], value };
    }
  }
  return values.map((_, index) => tokens[index]?.id ?? `array-${index}`);
}

function hashTableState(
  step: ExecutionTraceStep,
  metrics: ExecutionMetrics,
  status: VisualizationState["status"]
): import("@/contracts/events/visualization-state").HashTableVisualState {
  const state = (step.stateAfter ?? {}) as { capacity?: number; buckets?: string[][] };
  const payload = (step.event.payload ?? {}) as Record<string, unknown>;
  const buckets = Array.isArray(state.buckets)
    ? state.buckets
    : Array.from({ length: state.capacity ?? 8 }, () => [] as string[]);
  const activeBucket = typeof payload.bucket === "number" ? payload.bucket : undefined;
  const activeKey = typeof payload.key === "string" ? payload.key : undefined;
  const entries = buckets.map((bucket, index) => ({
    index,
    entries: Array.isArray(bucket) ? [...bucket] : [],
    state: index === activeBucket ? ("active" as const) : ("default" as const),
  }));
  return {
    type: "hash-table",
    stepIndex: step.stepIndex,
    activeElements: activeBucket === undefined ? [] : [activeBucket],
    highlightedElements: activeKey ? [activeKey] : [],
    visitedNodes: [],
    queueState: [],
    stackState: [],
    metrics,
    status,
    buckets: entries,
    activeBucket,
    activeKey,
  };
}

function linearState(
  kind: "stack" | "queue" | "linked-list",
  step: ExecutionTraceStep,
  metrics: ExecutionMetrics,
  status: VisualizationState["status"]
): import("@/contracts/events/visualization-state").VisualStateSnapshot {
  const state = (step.stateAfter ?? {}) as Record<string, unknown>;
  const payload = (step.event.payload ?? {}) as Record<string, unknown>;
  const active = typeof payload.value === "number" ? [payload.value] : [];
  if (kind === "stack") {
    const items = Array.isArray(state.items) ? state.items : [];
    return {
      type: "stack",
      stepIndex: step.stepIndex,
      activeElements: active,
      highlightedElements: active,
      visitedNodes: [],
      queueState: [],
      stackState: items,
      metrics,
      status,
      items,
    };
  }
  if (kind === "queue") {
    const items = Array.isArray(state.items) ? state.items : [];
    return {
      type: "queue",
      stepIndex: step.stepIndex,
      activeElements: active,
      highlightedElements: active,
      visitedNodes: [],
      queueState: items,
      stackState: [],
      metrics,
      status,
      items,
    };
  }
  const raw = Array.isArray(state.items) ? state.items : [];
  const currentId = typeof payload.nodeId === "string" ? payload.nodeId : undefined;
  const items = raw.flatMap((item) => {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as { id?: unknown }).id !== "string"
    )
      return [];
    const typed = item as { id: string; value: number };
    return [
      {
        id: typed.id,
        value: typed.value,
        state:
          typed.id === currentId
            ? "current"
            : ("default" as import("@/contracts/events/visualization-state").SemanticVisualState),
      },
    ];
  });
  return {
    type: "linked-list",
    stepIndex: step.stepIndex,
    activeElements: currentId ? [currentId] : [],
    highlightedElements: currentId ? [currentId] : [],
    visitedNodes: currentId ? [currentId] : [],
    queueState: [],
    stackState: [],
    metrics,
    status,
    items,
  };
}

import type { CanonicalExecutionTrace, ExecutionTraceStep } from "@/contracts/events/trace-events";
import type {
  ArrayVisualState,
  LinearItemVisual,
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
        : slug === "stack" || slug === "queue" || slug === "linked-list"
          ? linearState(slug, trace, step, metrics, status)
          : slug === "hash-table"
            ? hashTableState(step, metrics, status)
            : slug === "heap"
              ? deriveHeapStepView(step, metrics, status, trace)
              : arrayState(slug, trace, step, metrics, status);
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
  slug: string,
  trace: CanonicalExecutionTrace,
  step: ExecutionTraceStep,
  metrics: ExecutionMetrics,
  status: VisualizationState["status"]
): ArrayVisualState {
  const isSearch = slug === "binary-search" || slug === "linear-search";
  const after = Array.isArray(step.stateAfter) ? (step.stateAfter as number[]) : [7, 3, 9, 2, 5];
  const payload = (step.event.payload ?? {}) as Record<string, unknown>;
  const indexes = Array.isArray(payload.indexes)
    ? payload.indexes.filter((x): x is number => typeof x === "number")
    : typeof payload.index === "number"
      ? [payload.index]
      : [];
  const elementIds = deriveStableElementIds(trace, step.stepIndex, after);
  const elementStates: Record<number, SemanticVisualState> = {};
  const pointers: Record<string, number> = {};
  let activeRange: [number, number] | undefined;

  if (typeof payload.low === "number" && typeof payload.high === "number") {
    activeRange = [payload.low, payload.high];
    pointers.low = payload.low;
    pointers.high = payload.high;
    for (let i = 0; i < after.length; i++) {
      if (i < payload.low || i > payload.high) elementStates[i] = "disabled";
    }
  }
  if (typeof payload.mid === "number") {
    pointers.mid = payload.mid;
  }

  if (step.event.type === "SWAP" || step.event.type === "COMPARE") {
    const state = step.event.type === "SWAP" ? "swapping" : "comparing";
    indexes.forEach((index) => {
      elementStates[index] = state;
    });
    if (step.event.type === "COMPARE" && typeof payload.mid === "number") {
      elementStates[payload.mid] = "comparing";
    }
  } else if (step.event.type === "WRITE") {
    indexes.forEach((index) => {
      elementStates[index] = "writing";
    });
  } else if (step.event.type === "SELECT") {
    indexes.forEach((index) => {
      elementStates[index] = "selected";
    });
  } else if (step.event.type === "SET_CURRENT" && typeof payload.index === "number") {
    elementStates[payload.index] = "current";
  } else if (step.event.type === "PIVOT" && typeof payload.index === "number") {
    elementStates[payload.index] = "pivot";
  } else if (step.event.type === "FOUND" && typeof payload.index === "number") {
    // Keep non-target search cells in their normal blue state on the final result frame.
    // Only the matched value receives the success treatment, as shown in the approved UI.
    elementStates[payload.index] = "success";
    const previousComparison = trace.steps
      .slice(0, step.stepIndex)
      .slice()
      .reverse()
      .find((candidate) => candidate.event.type === "COMPARE");
    const previousPayload = (previousComparison?.event.payload ?? {}) as Record<string, unknown>;
    for (const pointerName of ["low", "mid", "high"] as const) {
      const pointerValue = previousPayload[pointerName];
      if (typeof pointerValue === "number") pointers[pointerName] = pointerValue;
    }
    pointers.found = payload.index;
  } else if (step.event.type === "NOT_FOUND") {
    for (let i = 0; i < after.length; i++) elementStates[i] = "disabled";
    const previousComparison = trace.steps
      .slice(0, step.stepIndex)
      .slice()
      .reverse()
      .find((candidate) => candidate.event.type === "COMPARE");
    const previousPayload = (previousComparison?.event.payload ?? {}) as Record<string, unknown>;
    for (const pointerName of ["low", "mid", "high"] as const) {
      const pointerValue = previousPayload[pointerName];
      if (typeof pointerValue === "number") pointers[pointerName] = pointerValue;
    }
  } else if (step.event.type === "MARK_SORTED") {
    indexes.forEach((index) => {
      elementStates[index] = "sorted";
    });
  } else if (step.event.type === "COMPLETE" && isSearch) {
    const precedingSteps = trace.steps.slice(0, step.stepIndex + 1);
    const foundStep = precedingSteps
      .slice()
      .reverse()
      .find((candidate) => candidate.event.type === "FOUND");
    const foundPayload = (foundStep?.event.payload ?? {}) as Record<string, unknown>;
    const foundIndex = typeof foundPayload.index === "number" ? foundPayload.index : undefined;
    const previousComparison = precedingSteps
      .slice()
      .reverse()
      .find((candidate) => candidate.event.type === "COMPARE");
    const previousPayload = (previousComparison?.event.payload ?? {}) as Record<string, unknown>;
    for (const pointerName of ["low", "mid", "high"] as const) {
      const pointerValue = previousPayload[pointerName];
      if (typeof pointerValue === "number") pointers[pointerName] = pointerValue;
    }
    if (foundIndex !== undefined) {
      // The completed search frame should preserve the blue default bars around the match.
      elementStates[foundIndex] = "success";
      pointers.found = foundIndex;
    }
  }

  const activeIndexes =
    indexes.length > 0 ? indexes : typeof payload.mid === "number" ? [payload.mid] : [];
  const sortedIndexes =
    step.event.type === "COMPLETE" && !isSearch
      ? after.map((_, i) => i)
      : step.event.type === "MARK_SORTED"
        ? indexes
        : [];

  return toArrayVisualizationState(
    {
      values: after,
      elementIds,
      elementStates,
      activeIndexes,
      highlightedIndexes: activeIndexes,
      sortedIndexes,
      activeRange,
      pointers,
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
  let lifted: { id: string; value: number } | undefined;
  let holeIndex: number | undefined;

  const commitLifted = (): void => {
    if (lifted !== undefined && holeIndex !== undefined && tokens[holeIndex]) {
      tokens[holeIndex] = lifted;
    }
    lifted = undefined;
    holeIndex = undefined;
  };

  for (const traceStep of trace.steps.slice(0, stepIndex + 1)) {
    const payload = (traceStep.event.payload ?? {}) as Record<string, unknown>;
    const indexes = Array.isArray(payload.indexes)
      ? payload.indexes.filter((x): x is number => typeof x === "number")
      : [];

    if (traceStep.event.type === "SET_CURRENT" && typeof payload.index === "number") {
      commitLifted();
      const idx = payload.index;
      if (tokens[idx]) {
        lifted = tokens[idx];
        holeIndex = idx;
      }
    } else if (traceStep.event.type === "SWAP" && indexes.length >= 2) {
      commitLifted();
      const [a, b] = indexes;
      if (tokens[a] && tokens[b]) {
        [tokens[a], tokens[b]] = [tokens[b], tokens[a]];
      }
    } else if (traceStep.event.type === "WRITE") {
      const target = indexes[0] ?? (typeof payload.index === "number" ? payload.index : undefined);
      if (target !== undefined) {
        if (lifted !== undefined && holeIndex !== undefined && target === holeIndex && target > 0) {
          tokens[target] = tokens[target - 1]!;
          holeIndex = target - 1;
        } else if (tokens[target]) {
          const value = values[target];
          if (typeof value === "number") tokens[target] = { ...tokens[target], value };
        }
      }
    } else if (traceStep.event.type === "COMPLETE" || traceStep.event.type === "MARK_SORTED") {
      commitLifted();
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

function deriveLinearEntries(
  kind: "stack" | "queue",
  trace: CanonicalExecutionTrace,
  stepIndex: number,
  currentItems: unknown[]
): LinearItemVisual[] {
  const tokens: Array<{ id: string; value: unknown }> = [];
  let seq = 0;

  for (const traceStep of trace.steps.slice(0, stepIndex + 1)) {
    const payload = (traceStep.event.payload ?? {}) as Record<string, unknown>;
    if (kind === "stack") {
      if (traceStep.event.type === "PUSH") {
        tokens.push({ id: `stack-item-${seq++}`, value: payload.value });
      } else if (traceStep.event.type === "POP") {
        tokens.pop();
      }
    } else if (traceStep.event.type === "ENQUEUE") {
      tokens.push({ id: `queue-item-${seq++}`, value: payload.value });
    } else if (traceStep.event.type === "DEQUEUE") {
      tokens.shift();
    }
  }

  return currentItems.map((value, index) => ({
    id: tokens[index]?.id ?? `${kind}-fallback-${index}`,
    value,
  }));
}

function linearState(
  kind: "stack" | "queue" | "linked-list",
  trace: CanonicalExecutionTrace,
  step: ExecutionTraceStep,
  metrics: ExecutionMetrics,
  status: VisualizationState["status"]
): import("@/contracts/events/visualization-state").VisualStateSnapshot {
  const state = (step.stateAfter ?? {}) as Record<string, unknown>;
  const payload = (step.event.payload ?? {}) as Record<string, unknown>;
  const active = typeof payload.value === "number" ? [payload.value] : [];

  if (kind === "stack") {
    const items = Array.isArray(state.items) ? state.items : [];
    const entries = deriveLinearEntries("stack", trace, step.stepIndex, items).map(
      (entry, idx) => ({
        ...entry,
        state: (idx === items.length - 1 &&
        (step.event.type === "PUSH" || step.event.type === "READ")
          ? "current"
          : "default") as SemanticVisualState,
      })
    );
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
      itemEntries: entries,
    };
  }
  if (kind === "queue") {
    const items = Array.isArray(state.items) ? state.items : [];
    const entries = deriveLinearEntries("queue", trace, step.stepIndex, items).map(
      (entry, idx) => ({
        ...entry,
        state: ((idx === items.length - 1 && step.event.type === "ENQUEUE") ||
        (idx === 0 && step.event.type === "READ")
          ? "current"
          : "default") as SemanticVisualState,
      })
    );
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
      itemEntries: entries,
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
        state: (typed.id === currentId ? "current" : "default") as SemanticVisualState,
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

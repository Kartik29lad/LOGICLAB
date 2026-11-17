import type { CanonicalExecutionTrace, ExecutionTraceStep } from "@/contracts/events/trace-events";
import type {
  HeapVisualState,
  LinearItemVisual,
  VisualizationState,
} from "@/contracts/events/visualization-state";
import type { ExecutionMetrics } from "@/contracts/execution";

export function deriveHeapStepView(
  step: ExecutionTraceStep,
  metrics: ExecutionMetrics,
  status: VisualizationState["status"],
  trace?: CanonicalExecutionTrace
): HeapVisualState {
  const state = (step.stateAfter ?? {}) as Record<string, unknown>;
  const payload = (step.event.payload ?? {}) as Record<string, unknown>;
  const items = Array.isArray(state.items)
    ? state.items.filter((v): v is number => typeof v === "number")
    : [];
  const comparingIndexes = numberArray(payload.indexes);
  const swappingIndexes = step.event.type === "SWAP" ? comparingIndexes : [];
  const activeIndex = typeof payload.index === "number" ? payload.index : comparingIndexes[0];
  const mode = payload.mode === "max" ? "max" : "min";
  const itemEntries = deriveHeapEntries(items, step.stepIndex, trace);

  return {
    type: "heap",
    stepIndex: step.stepIndex,
    activeElements: activeIndex === undefined ? [] : [activeIndex],
    highlightedElements: comparingIndexes,
    visitedNodes: [],
    queueState: [],
    stackState: [],
    metrics,
    status,
    items,
    itemEntries,
    activeIndex,
    comparingIndexes,
    swappingIndexes,
    heapBoundary: typeof state.heapBoundary === "number" ? state.heapBoundary : items.length,
    mode,
  };
}

function deriveHeapEntries(
  items: readonly number[],
  stepIndex: number,
  trace?: CanonicalExecutionTrace
): LinearItemVisual<number>[] {
  if (!trace) {
    return items.map((value, index) => ({ id: `heap-${index}`, value }));
  }

  const tokens: Array<{ id: string; value: number }> = [];
  let seq = 0;

  for (const traceStep of trace.steps.slice(0, stepIndex + 1)) {
    const payload = (traceStep.event.payload ?? {}) as Record<string, unknown>;
    if (traceStep.event.type === "PUSH") {
      const value = typeof payload.value === "number" ? payload.value : 0;
      tokens.push({ id: `heap-item-${seq++}`, value });
    } else if (traceStep.event.type === "SWAP") {
      const indexes = numberArray(payload.indexes);
      if (indexes.length >= 2) {
        const [a, b] = indexes;
        if (a !== undefined && b !== undefined && tokens[a] && tokens[b]) {
          [tokens[a], tokens[b]] = [tokens[b], tokens[a]];
        }
      }
    } else if (traceStep.event.type === "POP") {
      tokens.shift();
      if (tokens.length > 0 || items.length > 0) {
        const after = ((traceStep.stateAfter as Record<string, unknown> | undefined)?.items ??
          []) as number[];
        const replacement = after[0] ?? 0;
        tokens.unshift({ id: `heap-item-${seq++}`, value: replacement });
        if (tokens.length > after.length) tokens.length = after.length;
      }
    }
  }

  return items.map((value, index) => ({
    id: tokens[index]?.id ?? `heap-${index}`,
    value,
  }));
}

function numberArray(value: unknown): number[] {
  return Array.isArray(value) ? value.filter((v): v is number => typeof v === "number") : [];
}

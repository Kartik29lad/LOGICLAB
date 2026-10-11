import type { ExecutionTraceStep } from "@/contracts/events/trace-events";
import type { HeapVisualState, VisualizationState } from "@/contracts/events/visualization-state";
import type { ExecutionMetrics } from "@/contracts/execution";

export function deriveHeapStepView(
  step: ExecutionTraceStep,
  metrics: ExecutionMetrics,
  status: VisualizationState["status"]
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
    activeIndex,
    comparingIndexes,
    swappingIndexes,
    heapBoundary: typeof state.heapBoundary === "number" ? state.heapBoundary : items.length,
    mode,
  };
}

function numberArray(value: unknown): number[] {
  return Array.isArray(value) ? value.filter((v): v is number => typeof v === "number") : [];
}

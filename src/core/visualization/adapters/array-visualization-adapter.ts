import type {
  ArrayVisualState,
  SemanticVisualState,
} from "../../../contracts/events/visualization-state";
import type { ExecutionMetrics } from "../../../contracts/execution";
import { createVisualizationCommon } from "./visualization-common";

export interface ArrayVisualizationInput {
  values: readonly number[];
  activeIndexes?: readonly number[];
  highlightedIndexes?: readonly number[];
  sortedIndexes?: readonly number[];
  pivotIndex?: number;
  selectedIndexes?: readonly number[];
  pointers?: Readonly<Record<string, number>>;
  elementIds?: readonly string[];
  elementStates?: Readonly<Record<number, SemanticVisualState>>;
}

export function toArrayVisualizationState(
  input: ArrayVisualizationInput,
  stepIndex: number,
  metrics: ExecutionMetrics,
  status: ArrayVisualState["status"]
): ArrayVisualState {
  const active = new Set(input.activeIndexes ?? []);
  const highlighted = new Set(input.highlightedIndexes ?? []);
  const sorted = new Set(input.sortedIndexes ?? []);
  const selected = new Set(input.selectedIndexes ?? []);
  const elements = input.values.map((value, index) => ({
    id: input.elementIds?.[index] ?? `array-${index}`,
    value,
    originalIndex: index,
    currentIndex: index,
    state:
      input.elementStates?.[index] ??
      stateFor(index, active, highlighted, sorted, selected, input.pivotIndex),
  }));
  return {
    type: "array",
    elements,
    pointers: { ...(input.pointers ?? {}) },
    activeIndexes: [...active],
    elementStates: input.elementStates ? { ...input.elementStates } : {},
    ...createVisualizationCommon(stepIndex, metrics, status, [...active], [...highlighted]),
  };
}

function stateFor(
  index: number,
  active: Set<number>,
  highlighted: Set<number>,
  sorted: Set<number>,
  selected: Set<number>,
  pivot?: number
): SemanticVisualState {
  if (pivot === index) return "pivot";
  if (sorted.has(index)) return "sorted";
  if (active.has(index)) return "comparing";
  if (selected.has(index)) return "selected";
  if (highlighted.has(index)) return "active";
  return "default";
}

import type { VisualizationCommonState } from "../../../contracts/events/visualization-state";
import type { ExecutionMetrics } from "../../../contracts/execution";

export function createVisualizationCommon(
  stepIndex: number,
  metrics: ExecutionMetrics,
  status: VisualizationCommonState["status"],
  activeElements: Array<string | number> = [],
  highlightedElements: Array<string | number> = [],
  visitedNodes: string[] = [],
  currentNode?: string,
  queueState: unknown[] = [],
  stackState: unknown[] = []
): VisualizationCommonState {
  return {
    stepIndex,
    activeElements: [...activeElements],
    highlightedElements: [...highlightedElements],
    visitedNodes: [...visitedNodes],
    currentNode,
    queueState: [...queueState],
    stackState: [...stackState],
    metrics: { ...metrics },
    status,
  };
}

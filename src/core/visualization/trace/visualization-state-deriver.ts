import type {
  VisualizationState,
  VisualStateSnapshot,
} from "../../../contracts/events/visualization-state";
import type { ExecutionMetrics } from "../../../contracts/execution";

export interface VisualizationStateDeriver<TState, TVisual extends VisualStateSnapshot> {
  derive(
    state: TState,
    stepIndex: number,
    metrics: ExecutionMetrics,
    status: VisualizationState["status"]
  ): TVisual;
}

export function deriveVisualizationState<TState, TVisual extends VisualStateSnapshot>(
  deriver: VisualizationStateDeriver<TState, TVisual>,
  state: TState,
  stepIndex: number,
  metrics: ExecutionMetrics,
  status: VisualizationState["status"]
): VisualizationState {
  const visualization = deriver.derive(state, stepIndex, metrics, status);
  return {
    stepIndex,
    activeElements: [...visualization.activeElements],
    highlightedElements: [...visualization.highlightedElements],
    visitedNodes: [...visualization.visitedNodes],
    currentNode: visualization.currentNode,
    queueState: [...visualization.queueState],
    stackState: [...visualization.stackState],
    metrics: { ...visualization.metrics },
    status,
    visualization,
    executionTraceStep: stepIndex,
  };
}

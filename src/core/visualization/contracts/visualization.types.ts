import type {
  StepActionType,
  StepHighlight,
  TraceMetrics,
} from "../../../contracts/events/trace-events";
import type {
  ArrayVisualState,
  GraphVisualState,
  TreeVisualState,
  VisualStateSnapshot,
} from "../../../contracts/events/visualization-state";

export type VisualElementType = "array" | "graph" | "tree" | "grid";

export type ArrayElementVisualState =
  "default" | "comparing" | "swapping" | "sorted" | "selected" | "pivot";

export type GraphNodeVisualState = "unvisited" | "visiting" | "visited" | "current" | "target";

export type GraphEdgeVisualState = "default" | "active" | "traversed" | "shortest-path";

export type VisualizationStatus = "idle" | "running" | "paused" | "completed" | "failed";

export interface NormalizedVisualFrame {
  stepIndex: number;
  totalSteps: number;
  description: string;
  action: StepActionType | string;
  snapshot: VisualStateSnapshot;
  activeElements: (number | string)[];
  highlightedElements: StepHighlight[];
  visitedNodes: string[];
  currentNode: string | null;
  queueState: (number | string)[];
  stackState: (number | string)[];
  arrayState?: ArrayVisualState;
  graphState?: GraphVisualState;
  metrics: TraceMetrics;
  status: VisualizationStatus;
  activePointers: Record<string, number | string>;
  isCompleted: boolean;
}

export type NormalizedVisualizationState = NormalizedVisualFrame;

export type { ArrayVisualState, GraphVisualState, TreeVisualState, VisualStateSnapshot };

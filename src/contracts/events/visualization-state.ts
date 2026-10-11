/** Normalized, renderer-independent visualization state contracts. */

export type SemanticVisualState =
  | "default"
  | "current"
  | "selected"
  | "comparing"
  | "swapping"
  | "active"
  | "visited"
  | "discovered"
  | "sorted"
  | "target"
  | "path"
  | "pivot"
  | "writing"
  | "boundary"
  | "disabled"
  | "error"
  | "success";

export interface VisualizationCommonState {
  stepIndex: number;
  activeElements: Array<string | number>;
  highlightedElements: Array<string | number>;
  visitedNodes: string[];
  currentNode?: string;
  queueState: unknown[];
  stackState: unknown[];
  metrics: Readonly<Record<string, number>>;
  status: "idle" | "ready" | "running" | "paused" | "completed" | "error";
}

export interface ArrayElementVisual {
  id: string;
  value: number;
  originalIndex: number;
  currentIndex: number;
  state: SemanticVisualState;
}

export interface ArrayVisualState extends VisualizationCommonState {
  type: "array";
  elements: ArrayElementVisual[];
  pointers: Record<string, number>;
  activeIndexes?: number[];
  elementStates?: Record<number, SemanticVisualState>;
}

export interface GraphNodeVisual {
  id: string;
  label: string;
  x?: number;
  y?: number;
  state: SemanticVisualState;
  distance?: number;
  heuristic?: number;
  fScore?: number;
  parentId?: string;
}

export interface GraphEdgeVisual {
  source: string;
  target: string;
  weight?: number;
  state: SemanticVisualState;
}

export interface GraphVisualState extends VisualizationCommonState {
  type: "graph";
  nodes: GraphNodeVisual[];
  edges: GraphEdgeVisual[];
  directed: boolean;
  path: string[];
  distances: Record<string, number>;
  parents: Record<string, string | undefined>;
  queueState: string[];
  discoveredNodes: string[];
  traversalOrder: string[];
  currentEdge?: { source: string; target: string };
  algorithmPhase?: "push" | "discover" | "dequeue" | "visit" | "backtrack" | "complete";
  stackState: string[];
  currentPath: string[];
  heuristic?: Record<string, number>;
  fScores?: Record<string, number>;
  openSet?: string[];
  closedSet?: string[];
  targetNode?: string;
  algorithmMode?: "bfs" | "dfs" | "dijkstra" | "a-star";
}

export interface TreeNodeVisual {
  id: string;
  value: number | string;
  leftId?: string;
  rightId?: string;
  state: SemanticVisualState;
}

export interface TreeVisualState extends VisualizationCommonState {
  type: "tree";
  rootId?: string;
  nodes: Record<string, TreeNodeVisual>;
}

export interface StackVisualState extends VisualizationCommonState {
  type: "stack";
  items: unknown[];
}

export interface QueueVisualState extends VisualizationCommonState {
  type: "queue";
  items: unknown[];
}

export interface LinkedListVisualState extends VisualizationCommonState {
  type: "linked-list";
  items: Array<{ id: string; value: unknown; state: SemanticVisualState }>;
}

export interface HashTableVisualState extends VisualizationCommonState {
  type: "hash-table";
  buckets: Array<{ index: number; entries: unknown[]; state: SemanticVisualState }>;
  activeBucket?: number;
  activeKey?: string;
}

export interface HeapVisualState extends VisualizationCommonState {
  type: "heap";
  items: number[];
  activeIndex?: number;
  comparingIndexes: number[];
  swappingIndexes: number[];
  heapBoundary: number;
  mode: "min" | "max";
}

export interface GridVisualState extends VisualizationCommonState {
  type: "grid";
  rows: unknown[][];
}

export type VisualizationType =
  | "array"
  | "graph"
  | "tree"
  | "stack"
  | "queue"
  | "linked-list"
  | "hash-table"
  | "heap"
  | "grid"
  | "matrix"
  | "text"
  | "code"
  | "chart"
  | "comparison";

export interface GenericVisualState extends VisualizationCommonState {
  type: "matrix" | "text" | "code" | "chart" | "comparison";
  data: unknown;
}

export type VisualStateSnapshot =
  | ArrayVisualState
  | GraphVisualState
  | TreeVisualState
  | StackVisualState
  | QueueVisualState
  | LinkedListVisualState
  | HashTableVisualState
  | HeapVisualState
  | GridVisualState
  | GenericVisualState;

export interface VisualizationState extends VisualizationCommonState {
  type?: VisualStateSnapshot["type"];
  selectedAlgorithm?: string;
  input?: unknown;
  executionTraceStep: number;
  result?: unknown;
  error?: string;
  visualization: VisualStateSnapshot;
}

export interface VisualizationSessionState<TTrace = unknown> {
  selectedAlgorithm: string;
  input: unknown;
  executionTrace: TTrace;
  currentStep: number;
  playbackStatus: "IDLE" | "READY" | "PLAYING" | "PAUSED" | "COMPLETED" | "ERROR";
  speed: number;
  result?: unknown;
  metrics: Readonly<Record<string, number>>;
  error?: string;
}

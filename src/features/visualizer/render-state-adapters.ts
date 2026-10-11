import type {
  ArrayVisualState,
  GraphVisualState,
  SemanticVisualState,
} from "@/contracts/events/visualization-state";
import type { ExecutionMetrics } from "@/contracts/execution";

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
      arrayNodeState(index, active, highlighted, sorted, selected, input.pivotIndex),
  }));
  return {
    type: "array",
    stepIndex,
    metrics,
    status,
    elements,
    activeElements: input.activeIndexes ? [...input.activeIndexes] : [],
    highlightedElements: input.highlightedIndexes ? [...input.highlightedIndexes] : [],
    visitedNodes: [],
    queueState: [],
    stackState: [],
    activeIndexes: input.activeIndexes ? [...input.activeIndexes] : [],
    elementStates: input.elementStates ? { ...input.elementStates } : undefined,
    pointers: input.pointers ?? {},
  };
}

function arrayNodeState(
  index: number,
  active: Set<number>,
  highlighted: Set<number>,
  sorted: Set<number>,
  selected: Set<number>,
  pivotIndex?: number
): SemanticVisualState {
  if (pivotIndex === index) return "pivot";
  if (selected.has(index)) return "selected";
  if (active.has(index)) return "comparing";
  if (highlighted.has(index)) return "active";
  if (sorted.has(index)) return "sorted";
  return "default";
}

export interface GraphVisualizationInput {
  nodes: readonly { id: string; label: string; x: number; y: number }[];
  edges: readonly { source: string; target: string; weight: number }[];
  directed: boolean;
  currentNode?: string;
  visitedNodes?: readonly string[];
  targetNode?: string;
  path?: readonly string[];
  distances?: Readonly<Record<string, number>>;
  parents?: Readonly<Record<string, string | undefined>>;
  activeEdges?: readonly string[];
  queueState?: readonly string[];
  discoveredNodes?: readonly string[];
  traversalOrder?: readonly string[];
  currentEdge?: { source: string; target: string };
  algorithmMode?: GraphVisualState["algorithmMode"];
  algorithmPhase?: GraphVisualState["algorithmPhase"];
  stackState?: readonly string[];
  currentPath?: readonly string[];
  heuristic?: Readonly<Record<string, number>>;
  fScores?: Readonly<Record<string, number>>;
  openSet?: readonly string[];
  closedSet?: readonly string[];
}

export function toGraphVisualizationState(
  input: GraphVisualizationInput,
  stepIndex: number,
  metrics: ExecutionMetrics,
  status: GraphVisualState["status"]
): GraphVisualState {
  const visited = new Set(input.visitedNodes ?? []);
  const discovered = new Set(input.discoveredNodes ?? []);
  const path = new Set(input.path ?? []);
  const nodes = input.nodes.map((node) => ({
    id: node.id,
    label: node.label,
    x: node.x,
    y: node.y,
    state: graphNodeState(node.id, input.currentNode, input.targetNode, visited, discovered, path),
    distance: input.distances?.[node.id],
    heuristic: input.heuristic?.[node.id],
    fScore: input.fScores?.[node.id],
    parentId: input.parents?.[node.id],
  }));
  const edges = input.edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    weight: edge.weight,
    state: edgeState(edge, input.activeEdges ?? [], path),
  }));
  return {
    type: "graph",
    stepIndex,
    metrics,
    status,
    nodes,
    edges,
    directed: input.directed,
    currentNode: input.currentNode,
    targetNode: input.targetNode,
    visitedNodes: input.visitedNodes ? [...input.visitedNodes] : [],
    discoveredNodes: input.discoveredNodes ? [...input.discoveredNodes] : [],
    path: input.path ? [...input.path] : [],
    queueState: input.queueState ? [...input.queueState] : [],
    stackState: input.stackState ? [...input.stackState] : [],
    traversalOrder: input.traversalOrder ? [...input.traversalOrder] : [],
    currentEdge: input.currentEdge,
    distances: (input.distances ?? {}) as Record<string, number>,
    parents: (input.parents ?? {}) as Record<string, string | undefined>,
    algorithmMode: input.algorithmMode,
    algorithmPhase: input.algorithmPhase,
    activeElements: input.currentNode ? [input.currentNode] : [],
    highlightedElements: input.activeEdges ? [...input.activeEdges] : [],
    currentPath: input.currentPath ? [...input.currentPath] : [],
    heuristic: input.heuristic,
    fScores: input.fScores,
    openSet: input.openSet ? [...input.openSet] : [],
    closedSet: input.closedSet ? [...input.closedSet] : [],
  };
}

function graphNodeState(
  id: string,
  current?: string,
  target?: string,
  visited = new Set<string>(),
  discovered = new Set<string>(),
  path = new Set<string>()
): SemanticVisualState {
  if (current === id) return "current";
  if (target === id) return "target";
  if (path.has(id)) return "path";
  if (visited.has(id)) return "visited";
  if (discovered.has(id)) return "discovered";
  return "default";
}

function edgeState(
  edge: { source: string; target: string },
  activeEdges: readonly string[],
  path: Set<string>
): SemanticVisualState {
  const forward = `${edge.source}->${edge.target}`;
  const backward = `${edge.target}->${edge.source}`;
  if (activeEdges.includes(forward) || activeEdges.includes(backward)) return "active";
  if (path.has(edge.source) && path.has(edge.target)) return "path";
  return "default";
}

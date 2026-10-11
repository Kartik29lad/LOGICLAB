import type {
  GraphVisualState,
  SemanticVisualState,
} from "../../../contracts/events/visualization-state";
import type { ExecutionMetrics } from "../../../contracts/execution";
import type { GraphEdge, GraphNode } from "../../graph/models/graph";
import { createVisualizationCommon } from "./visualization-common";

export interface GraphVisualizationInput {
  nodes: readonly GraphNode[];
  edges: readonly GraphEdge[];
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
    ...createVisualizationCommon(
      stepIndex,
      metrics,
      status,
      [input.currentNode ?? ""].filter(Boolean),
      [...path],
      [...visited],
      input.currentNode,
      input.queueState ? [...input.queueState] : []
    ),
    type: "graph",
    nodes,
    edges,
    directed: input.directed,
    path: [...path],
    distances: { ...(input.distances ?? {}) },
    parents: { ...(input.parents ?? {}) },
    queueState: [...(input.queueState ?? [])],
    discoveredNodes: [...discovered],
    traversalOrder: [...(input.traversalOrder ?? visited)],
    currentEdge: input.currentEdge,
    algorithmMode: input.algorithmMode,
    algorithmPhase: input.algorithmPhase,
    stackState: [...(input.stackState ?? [])],
    currentPath: [...(input.currentPath ?? [])],
    heuristic: { ...(input.heuristic ?? {}) },
    fScores: { ...(input.fScores ?? {}) },
    openSet: [...(input.openSet ?? [])],
    closedSet: [...(input.closedSet ?? [])],
  };
}

function graphNodeState(
  id: string,
  current: string | undefined,
  target: string | undefined,
  visited: Set<string>,
  discovered: Set<string>,
  path: Set<string>
): SemanticVisualState {
  if (path.has(id)) return "path";
  if (target === id) return "target";
  if (current === id) return "current";
  if (visited.has(id)) return "visited";
  if (discovered.has(id)) return "discovered";
  return "default";
}

function edgeState(
  edge: GraphEdge,
  active: readonly string[],
  path: Set<string>
): SemanticVisualState {
  const forward = `${edge.source}->${edge.target}`;
  const reverse = `${edge.target}->${edge.source}`;
  if (active.includes(forward) || active.includes(reverse)) return "active";
  if (path.has(edge.source) && path.has(edge.target)) return "path";
  return "default";
}

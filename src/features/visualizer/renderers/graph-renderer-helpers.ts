import type { GraphVisualState, SemanticVisualState } from "@/contracts/events/visualization-state";

export type GraphPoint = { x: number; y: number };

export const STATE_LABELS: Partial<Record<SemanticVisualState, string>> = {
  current: "Current",
  visited: "Visited",
  discovered: "Discovered",
  target: "Target",
  path: "Path",
  active: "Active",
};

export function layoutNodes(
  nodes: GraphVisualState["nodes"]
): Array<GraphVisualState["nodes"][number] & GraphPoint> {
  const columns = Math.max(2, Math.ceil(Math.sqrt(nodes.length)));
  return nodes.map((node, index) => ({
    ...node,
    x: node.x ?? 100 + (index % columns) * Math.min(210, 560 / Math.max(columns - 1, 1)),
    y: node.y ?? 90 + Math.floor(index / columns) * 135,
  }));
}

export function getGraphEdgeId(
  edge: { id?: string; source: string; target: string },
  occurrence = 0
): string {
  if (edge.id) return edge.id;
  return occurrence === 0
    ? `edge:${edge.source}->${edge.target}`
    : `edge:${edge.source}->${edge.target}#${occurrence}`;
}

export interface GraphEdgeGeometry {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number;
  pathData: string;
}

export function computeEdgeGeometry(
  source: GraphPoint,
  target: GraphPoint,
  nodeRadius = 26
): GraphEdgeGeometry {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const rawLength = Math.max(Math.hypot(dx, dy), 1);
  const offsetX = (dx / rawLength) * nodeRadius;
  const offsetY = (dy / rawLength) * nodeRadius;
  const x1 = source.x + offsetX;
  const y1 = source.y + offsetY;
  const x2 = target.x - offsetX;
  const y2 = target.y - offsetY;
  const length = Math.max(Math.hypot(x2 - x1, y2 - y1), 1);
  return {
    x1,
    y1,
    x2,
    y2,
    length,
    pathData: `M ${x1} ${y1} L ${x2} ${y2}`,
  };
}

export function describeGraphState(state: GraphVisualState): string {
  if (state.currentNode) return `Current node: ${state.currentNode}`;
  if (state.path.length > 0) return `Path: ${state.path.join(" → ")}`;
  if (state.visitedNodes.length > 0) return `${state.visitedNodes.length} nodes visited`;
  return "Graph ready";
}

export function bfsPhaseLabel(phase: GraphVisualState["algorithmPhase"]): string {
  if (phase === "discover") return "Discover + Enqueue";
  if (phase === "dequeue") return "Dequeue";
  if (phase === "visit") return "Visit";
  return "Complete";
}

export function formatScore(value: number | undefined): string {
  return value === undefined || !Number.isFinite(value)
    ? "∞"
    : Number.isInteger(value)
      ? String(value)
      : value.toFixed(1);
}

export function dfsPhaseLabel(phase: GraphVisualState["algorithmPhase"]): string {
  if (phase === "push") return "Enter depth";
  if (phase === "visit") return "Visit";
  if (phase === "backtrack") return "Backtrack";
  return "Complete";
}

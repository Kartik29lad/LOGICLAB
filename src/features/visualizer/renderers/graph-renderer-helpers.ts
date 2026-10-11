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

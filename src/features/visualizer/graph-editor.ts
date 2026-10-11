export interface EditableGraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface EditableGraphEdge {
  source: string;
  target: string;
  weight: number;
}

export interface GraphExperiment {
  nodes: EditableGraphNode[];
  edges: EditableGraphEdge[];
  directed: boolean;
  start: string;
  target?: string;
}

export const GRAPH_LIMITS = { nodes: 30, edges: 60 } as const;

export const DEFAULT_GRAPH_EXPERIMENT: GraphExperiment = {
  nodes: [
    { id: "A", label: "A", x: 120, y: 90 },
    { id: "B", label: "B", x: 340, y: 90 },
    { id: "C", label: "C", x: 120, y: 270 },
    { id: "D", label: "D", x: 340, y: 270 },
    { id: "E", label: "E", x: 560, y: 270 },
  ],
  edges: [
    { source: "A", target: "B", weight: 1 },
    { source: "A", target: "C", weight: 1 },
    { source: "B", target: "D", weight: 1 },
    { source: "C", target: "D", weight: 1 },
    { source: "D", target: "E", weight: 1 },
  ],
  directed: false,
  start: "A",
  target: "E",
};

export function cloneGraphExperiment(graph: GraphExperiment): GraphExperiment {
  return {
    nodes: graph.nodes.map((node) => ({ ...node })),
    edges: graph.edges.map((edge) => ({ ...edge })),
    directed: graph.directed,
    start: graph.start,
    target: graph.target,
  };
}

export function graphEdgeKey(source: string, target: string, directed: boolean): string {
  return directed ? `${source}->${target}` : [source, target].sort().join("--");
}

export function validateGraphExperiment(graph: GraphExperiment, algorithm: string): string | null {
  if (graph.nodes.length === 0) return "Add at least one node.";
  if (graph.nodes.length > GRAPH_LIMITS.nodes)
    return `Graphs are limited to ${GRAPH_LIMITS.nodes} nodes.`;
  if (graph.edges.length > GRAPH_LIMITS.edges)
    return `Graphs are limited to ${GRAPH_LIMITS.edges} edges.`;
  const ids = new Set<string>();
  for (const node of graph.nodes) {
    if (!/^[A-Za-z0-9_-]{1,12}$/.test(node.id))
      return "Node IDs may contain letters, numbers, _ and - (maximum 12 characters).";
    if (ids.has(node.id)) return `Node ID '${node.id}' is duplicated.`;
    ids.add(node.id);
    if (!node.label.trim()) return `Node '${node.id}' needs a label.`;
  }
  if (!ids.has(graph.start)) return "Choose a valid start node.";
  if (["a-star"].includes(algorithm) && (!graph.target || !ids.has(graph.target)))
    return "A* requires a valid target node.";
  const edgeKeys = new Set<string>();
  for (const edge of graph.edges) {
    if (!ids.has(edge.source) || !ids.has(edge.target))
      return "Every edge must connect existing nodes.";
    if (edge.source === edge.target) return "Self-loop edges are not supported in the visualizer.";
    if (!Number.isFinite(edge.weight) || edge.weight < 0)
      return "Edge weights must be finite and non-negative.";
    const key = graphEdgeKey(edge.source, edge.target, graph.directed);
    if (edgeKeys.has(key)) return `Duplicate edge '${edge.source} → ${edge.target}'.`;
    edgeKeys.add(key);
  }
  if (["dijkstra", "a-star"].includes(algorithm) && graph.edges.some((edge) => edge.weight < 0))
    return "Shortest-path algorithms require non-negative edge weights.";
  return null;
}

export function nextNodeId(nodes: readonly EditableGraphNode[]): string {
  const used = new Set(nodes.map((node) => node.id));
  for (let index = 0; index < 26; index += 1) {
    const candidate = String.fromCharCode(65 + index);
    if (!used.has(candidate)) return candidate;
  }
  let index = nodes.length + 1;
  while (used.has(`N${index}`)) index += 1;
  return `N${index}`;
}

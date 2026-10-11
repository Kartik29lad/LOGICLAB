export interface GraphAlgorithmMetadata {
  id: string;
  name: string;
  category: "traversal" | "shortest-path";
  description: string;
  time: { best: string; average: string; worst: string };
  space: string;
  requirements?: string[];
}

export const GRAPH_ALGORITHM_METADATA: readonly GraphAlgorithmMetadata[] = [
  {
    id: "graph-bfs",
    name: "Breadth-First Search",
    category: "traversal",
    description: "Traverses a graph level by level.",
    time: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
    space: "O(V)",
    requirements: ["Works with directed and undirected graphs."],
  },
  {
    id: "graph-dfs",
    name: "Depth-First Search",
    category: "traversal",
    description: "Explores a graph as deeply as possible before backtracking.",
    time: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
    space: "O(V)",
    requirements: ["Works with directed and undirected graphs."],
  },
  {
    id: "graph-dijkstra",
    name: "Dijkstra",
    category: "shortest-path",
    description: "Computes shortest paths from one source using non-negative edge weights.",
    time: { best: "O(V² + E)", average: "O(V² + E)", worst: "O(V² + E)" },
    space: "O(V)",
    requirements: ["All edge weights must be non-negative."],
  },
  {
    id: "graph-a-star",
    name: "A*",
    category: "shortest-path",
    description: "Finds a path using path cost plus a heuristic estimate.",
    time: { best: "O(E)", average: "O(E log V)", worst: "O(V² + E)" },
    space: "O(V)",
    requirements: [
      "All edge weights must be non-negative.",
      "An admissible/consistent heuristic is required for optimality guarantees.",
    ],
  },
];

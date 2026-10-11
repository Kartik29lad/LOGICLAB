import type { CodeReference } from "../../../schema/content-types";

export const code: CodeReference[] = [
  {
    language: "typescript",
    entryPoint: "bfs",
    source:
      'import type { Graph } from "../models/graph";\n\nexport interface BfsResult {\n  visitedOrder: string[];\n  distances: Record<string, number>;\n  predecessors: Record<string, string | null>;\n}\n\n/**\n * Breadth-First Search (BFS) graph traversal.\n */\nexport function breadthFirstSearch(graph: Graph, startNodeId: string): BfsResult {\n  const visitedOrder: string[] = [];\n  const distances: Record<string, number> = {};\n  const predecessors: Record<string, string | null> = {};\n  const visited = new Set<string>();\n  const queue: string[] = [];\n\n  if (!graph.hasNode(startNodeId)) {\n    return { visitedOrder, distances, predecessors };\n  }\n\n  visited.add(startNodeId);\n  distances[startNodeId] = 0;\n  predecessors[startNodeId] = null;\n  queue.push(startNodeId);\n\n  while (queue.length > 0) {\n    const current = queue.shift()!;\n    visitedOrder.push(current);\n\n    for (const neighbor of graph.getNeighbors(current)) {\n      if (!visited.has(neighbor.nodeId)) {\n        visited.add(neighbor.nodeId);\n        distances[neighbor.nodeId] = distances[current]! + 1;\n        predecessors[neighbor.nodeId] = current;\n        queue.push(neighbor.nodeId);\n      }\n    }\n  }\n\n  return { visitedOrder, distances, predecessors };\n}\n',
    stepMappings: [{ action: "MAIN", startLine: 1, endLine: 44 }],
  },
];

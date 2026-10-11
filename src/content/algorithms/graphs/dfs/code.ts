import type { CodeReference } from "../../../schema/content-types";

export const code: CodeReference[] = [
  {
    language: "typescript",
    entryPoint: "dfs",
    source:
      'import type { Graph } from "../models/graph";\n\nexport interface DfsResult {\n  visitedOrder: string[];\n}\n\n/**\n * Depth-First Search (DFS) graph traversal.\n */\nexport function depthFirstSearch(graph: Graph, startNodeId: string): DfsResult {\n  const visitedOrder: string[] = [];\n  const visited = new Set<string>();\n\n  if (!graph.hasNode(startNodeId)) {\n    return { visitedOrder };\n  }\n\n  function traverse(nodeId: string): void {\n    visited.add(nodeId);\n    visitedOrder.push(nodeId);\n\n    for (const neighbor of graph.getNeighbors(nodeId)) {\n      if (!visited.has(neighbor.nodeId)) {\n        traverse(neighbor.nodeId);\n      }\n    }\n  }\n\n  traverse(startNodeId);\n\n  return { visitedOrder };\n}\n',
    stepMappings: [{ action: "MAIN", startLine: 1, endLine: 33 }],
  },
];

import type { Graph } from "../models/graph";

export interface DfsResult {
  visitedOrder: string[];
}

/**
 * Depth-First Search (DFS) graph traversal.
 */
export function depthFirstSearch(graph: Graph, startNodeId: string): DfsResult {
  const visitedOrder: string[] = [];
  const visited = new Set<string>();

  if (!graph.hasNode(startNodeId)) {
    return { visitedOrder };
  }

  function traverse(nodeId: string): void {
    visited.add(nodeId);
    visitedOrder.push(nodeId);

    for (const neighbor of graph.getNeighbors(nodeId)) {
      if (!visited.has(neighbor.nodeId)) {
        traverse(neighbor.nodeId);
      }
    }
  }

  traverse(startNodeId);

  return { visitedOrder };
}

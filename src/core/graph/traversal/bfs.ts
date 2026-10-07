import type { Graph } from "../models/graph";

export interface BfsResult {
  visitedOrder: string[];
  distances: Record<string, number>;
  predecessors: Record<string, string | null>;
}

/**
 * Breadth-First Search (BFS) graph traversal.
 */
export function breadthFirstSearch(graph: Graph, startNodeId: string): BfsResult {
  const visitedOrder: string[] = [];
  const distances: Record<string, number> = {};
  const predecessors: Record<string, string | null> = {};
  const visited = new Set<string>();
  const queue: string[] = [];

  if (!graph.hasNode(startNodeId)) {
    return { visitedOrder, distances, predecessors };
  }

  visited.add(startNodeId);
  distances[startNodeId] = 0;
  predecessors[startNodeId] = null;
  queue.push(startNodeId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    visitedOrder.push(current);

    for (const neighbor of graph.getNeighbors(current)) {
      if (!visited.has(neighbor.nodeId)) {
        visited.add(neighbor.nodeId);
        distances[neighbor.nodeId] = distances[current]! + 1;
        predecessors[neighbor.nodeId] = current;
        queue.push(neighbor.nodeId);
      }
    }
  }

  return { visitedOrder, distances, predecessors };
}

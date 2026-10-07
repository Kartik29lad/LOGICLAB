import type { Graph } from "../models/graph";

export interface DijkstraResult {
  distances: Record<string, number>;
  predecessors: Record<string, string | null>;
  getPathTo: (targetId: string) => string[];
}

/**
 * Dijkstra's shortest path algorithm for graphs with non-negative edge weights.
 */
export function dijkstra(graph: Graph, startNodeId: string): DijkstraResult {
  const distances: Record<string, number> = {};
  const predecessors: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  for (const node of graph.getNodes()) {
    distances[node.id] = Infinity;
    predecessors[node.id] = null;
    unvisited.add(node.id);
  }

  if (!graph.hasNode(startNodeId)) {
    return {
      distances,
      predecessors,
      getPathTo: () => [],
    };
  }

  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    let closestNodeId: string | null = null;
    let shortestDist = Infinity;

    for (const nodeId of unvisited) {
      if (distances[nodeId]! < shortestDist) {
        shortestDist = distances[nodeId]!;
        closestNodeId = nodeId;
      }
    }

    if (closestNodeId === null || shortestDist === Infinity) {
      break;
    }

    unvisited.delete(closestNodeId);

    for (const neighbor of graph.getNeighbors(closestNodeId)) {
      if (!unvisited.has(neighbor.nodeId)) continue;

      const alt = distances[closestNodeId]! + neighbor.weight;
      if (alt < distances[neighbor.nodeId]!) {
        distances[neighbor.nodeId] = alt;
        predecessors[neighbor.nodeId] = closestNodeId;
      }
    }
  }

  function getPathTo(targetId: string): string[] {
    const path: string[] = [];
    let current: string | null = targetId;

    if (distances[targetId] === Infinity || !graph.hasNode(targetId)) {
      return [];
    }

    while (current !== null) {
      path.unshift(current);
      current = predecessors[current] ?? null;
    }
    return path;
  }

  return { distances, predecessors, getPathTo };
}

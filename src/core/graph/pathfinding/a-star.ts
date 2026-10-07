import type { Graph } from "../models/graph";

export interface AStarResult {
  path: string[];
  cost: number;
  visitedNodes: string[];
}

/**
 * A* Pathfinding algorithm on graphs with spatial coordinates or custom heuristic.
 */
export function aStar(
  graph: Graph,
  startId: string,
  targetId: string,
  heuristic?: (nodeAId: string, nodeBId: string) => number
): AStarResult {
  const defaultHeuristic = (aId: string, bId: string): number => {
    const nodeA = graph.getNode(aId);
    const nodeB = graph.getNode(bId);
    if (!nodeA || !nodeB || nodeA.x === undefined || nodeB.x === undefined) {
      return 0; // Degenerates gracefully to Dijkstra when coordinates are absent
    }
    const dx = (nodeA.x ?? 0) - (nodeB.x ?? 0);
    const dy = (nodeA.y ?? 0) - (nodeB.y ?? 0);
    return Math.sqrt(dx * dx + dy * dy);
  };

  const h = heuristic ?? defaultHeuristic;

  const openSet = new Set<string>([startId]);
  const visitedNodes: string[] = [];
  const cameFrom = new Map<string, string>();

  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  for (const node of graph.getNodes()) {
    gScore.set(node.id, Infinity);
    fScore.set(node.id, Infinity);
  }

  gScore.set(startId, 0);
  fScore.set(startId, h(startId, targetId));

  while (openSet.size > 0) {
    let current: string | null = null;
    let lowestF = Infinity;

    for (const node of openSet) {
      const f = fScore.get(node) ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        current = node;
      }
    }

    if (!current) break;

    visitedNodes.push(current);

    if (current === targetId) {
      const path: string[] = [current];
      let trace: string | undefined = current;
      while ((trace = cameFrom.get(trace))) {
        path.unshift(trace);
      }
      return {
        path,
        cost: gScore.get(targetId) ?? 0,
        visitedNodes,
      };
    }

    openSet.delete(current);

    for (const neighbor of graph.getNeighbors(current)) {
      const tentativeG = (gScore.get(current) ?? Infinity) + neighbor.weight;

      if (tentativeG < (gScore.get(neighbor.nodeId) ?? Infinity)) {
        cameFrom.set(neighbor.nodeId, current);
        gScore.set(neighbor.nodeId, tentativeG);
        fScore.set(neighbor.nodeId, tentativeG + h(neighbor.nodeId, targetId));

        openSet.add(neighbor.nodeId);
      }
    }
  }

  return {
    path: [],
    cost: Infinity,
    visitedNodes,
  };
}

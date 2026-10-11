import type { AlgorithmStepObserver } from "../../algorithms/contracts/algorithm-observer";
import type { Graph } from "../models/graph";

export interface AStarResult {
  path: string[];
  cost: number;
  visitedNodes: string[];
}

export interface AStarTraceState {
  openSet: string[];
  closedSet: string[];
  gScore: Record<string, number>;
  hScore: Record<string, number>;
  fScore: Record<string, number>;
  parents: Record<string, string | undefined>;
  current?: string;
  target?: string;
  path: string[];
}

/**
 * A* Pathfinding algorithm on graphs with spatial coordinates or custom heuristic.
 */
export function aStar(
  graph: Graph,
  startId: string,
  targetId: string,
  heuristic?: (nodeAId: string, nodeBId: string) => number,
  observer?: AlgorithmStepObserver
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

  if (!graph.hasNode(startId) || !graph.hasNode(targetId)) {
    return { path: [], cost: Infinity, visitedNodes: [] };
  }

  const h = heuristic ?? defaultHeuristic;

  const openSet = new Set<string>([startId]);
  const closedSet = new Set<string>();
  const visitedNodes: string[] = [];
  const cameFrom = new Map<string, string>();

  const gScore = new Map<string, number>();
  const hScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  for (const node of graph.getNodes()) {
    gScore.set(node.id, Infinity);
    fScore.set(node.id, Infinity);
  }

  for (const node of graph.getNodes()) hScore.set(node.id, h(node.id, targetId));
  gScore.set(startId, 0);
  fScore.set(startId, hScore.get(startId) ?? 0);

  const snapshot = (current?: string, path: string[] = []): AStarTraceState => ({
    openSet: [...openSet],
    closedSet: [...closedSet],
    gScore: Object.fromEntries(gScore),
    hScore: Object.fromEntries(hScore),
    fScore: Object.fromEntries(fScore),
    parents: Object.fromEntries(cameFrom),
    current,
    target: targetId,
    path,
  });

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
    observer?.emit(
      "VISIT",
      {
        node: current,
        visited: [...visitedNodes],
        openSet: [...openSet],
        closedSet: [...closedSet],
        g: gScore.get(current) ?? Infinity,
        h: hScore.get(current) ?? Infinity,
        f: fScore.get(current) ?? Infinity,
      },
      snapshot(current)
    );

    if (current === targetId) {
      const path: string[] = [current];
      let trace: string | undefined = current;
      while ((trace = cameFrom.get(trace))) {
        path.unshift(trace);
      }
      observer?.emit(
        "FOUND",
        {
          target: targetId,
          path,
          cost: gScore.get(targetId) ?? Infinity,
          g: gScore.get(targetId) ?? Infinity,
          h: hScore.get(targetId) ?? Infinity,
          f: fScore.get(targetId) ?? Infinity,
        },
        snapshot(current, path)
      );
      return {
        path,
        cost: gScore.get(targetId) ?? 0,
        visitedNodes,
      };
    }

    openSet.delete(current);
    closedSet.add(current);

    for (const neighbor of graph.getNeighbors(current)) {
      if (closedSet.has(neighbor.nodeId)) continue;
      const previousG = gScore.get(neighbor.nodeId) ?? Infinity;
      const heuristic = hScore.get(neighbor.nodeId) ?? h(neighbor.nodeId, targetId);
      const tentativeG = (gScore.get(current) ?? Infinity) + neighbor.weight;

      if (tentativeG < previousG) {
        cameFrom.set(neighbor.nodeId, current);
        gScore.set(neighbor.nodeId, tentativeG);
        hScore.set(neighbor.nodeId, heuristic);
        fScore.set(neighbor.nodeId, tentativeG + heuristic);
        openSet.add(neighbor.nodeId);
        observer?.emit(
          "RELAX",
          {
            from: current,
            to: neighbor.nodeId,
            distance: tentativeG,
            oldDistance: previousG,
            oldG: previousG,
            newG: tentativeG,
            h: heuristic,
            f: tentativeG + heuristic,
            oldF: previousG + heuristic,
            openSet: [...openSet],
            closedSet: [...closedSet],
          },
          snapshot(current)
        );
      }
    }
  }

  return {
    path: [],
    cost: Infinity,
    visitedNodes,
  };
}

import type { AlgorithmStepObserver } from "../../algorithms/contracts/algorithm-observer";
import type { Graph } from "../models/graph";

export interface BfsResult {
  visitedOrder: string[];
  distances: Record<string, number>;
  predecessors: Record<string, string | null>;
}

type BfsTraceState = {
  visited: string[];
  queue: string[];
  distances: Record<string, number>;
  predecessors: Record<string, string | null>;
  current?: string;
};

/**
 * Breadth-First Search (BFS) graph traversal.
 *
 * Trace payloads intentionally expose the algorithm's real queue, discovery,
 * distance, and parent state so visualizations can teach BFS without guessing.
 */
export function breadthFirstSearch(
  graph: Graph,
  startNodeId: string,
  observer?: AlgorithmStepObserver
): BfsResult {
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
  emitTrace(observer, "ENQUEUE", startNodeId, queue, visitedOrder, distances, predecessors);

  while (queue.length > 0) {
    const current = queue.shift()!;
    emitTrace(observer, "DEQUEUE", current, queue, visitedOrder, distances, predecessors, current);
    visitedOrder.push(current);
    emitTrace(observer, "VISIT", current, queue, visitedOrder, distances, predecessors, current);

    for (const neighbor of graph.getNeighbors(current)) {
      if (!visited.has(neighbor.nodeId)) {
        visited.add(neighbor.nodeId);
        distances[neighbor.nodeId] = distances[current]! + 1;
        predecessors[neighbor.nodeId] = current;
        queue.push(neighbor.nodeId);
        emitTrace(
          observer,
          "ENQUEUE",
          neighbor.nodeId,
          queue,
          visitedOrder,
          distances,
          predecessors,
          current
        );
      }
    }
  }

  return { visitedOrder, distances, predecessors };
}

function emitTrace(
  observer: AlgorithmStepObserver | undefined,
  type: "ENQUEUE" | "DEQUEUE" | "VISIT",
  node: string,
  queue: string[],
  visitedOrder: string[],
  distances: Record<string, number>,
  predecessors: Record<string, string | null>,
  current?: string
): void {
  const state: BfsTraceState = {
    visited: [...visitedOrder],
    queue: [...queue],
    distances: { ...distances },
    predecessors: { ...predecessors },
    ...(current ? { current } : {}),
  };
  observer?.emit(
    type,
    {
      node,
      queue: [...queue],
      visited: [...visitedOrder],
      distances: { ...distances },
      parents: { ...predecessors },
      ...(current ? { current } : {}),
    },
    state
  );
}

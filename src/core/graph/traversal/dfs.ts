import type { AlgorithmStepObserver } from "../../algorithms/contracts/algorithm-observer";
import type { Graph } from "../models/graph";

export interface DfsResult {
  visitedOrder: string[];
}

type DfsTraceState = {
  visited: string[];
  stack: string[];
  traversalOrder: string[];
  current?: string;
  currentPath: string[];
  currentEdge?: { source: string; target: string };
  phase: "push" | "visit" | "backtrack" | "complete";
};

/**
 * Depth-First Search (DFS) graph traversal.
 *
 * Trace payloads expose the real recursion-stack semantics so the visualizer
 * can teach depth-first exploration and backtracking without reconstructing it.
 */
export function depthFirstSearch(
  graph: Graph,
  startNodeId: string,
  observer?: AlgorithmStepObserver
): DfsResult {
  const visitedOrder: string[] = [];
  const visited = new Set<string>();
  const stack: string[] = [];

  if (!graph.hasNode(startNodeId)) {
    return { visitedOrder };
  }

  function emit(
    type: "PUSH" | "VISIT" | "BACKTRACK",
    node: string,
    phase: DfsTraceState["phase"],
    currentEdge?: { source: string; target: string },
    returnTo?: string
  ): void {
    const state: DfsTraceState = {
      visited: [...visitedOrder],
      stack: [...stack],
      traversalOrder: [...visitedOrder],
      current: stack.at(-1),
      currentPath: [...stack],
      currentEdge,
      phase,
    };
    observer?.emit(
      type,
      {
        node,
        stack: [...stack],
        visited: [...visitedOrder],
        traversalOrder: [...visitedOrder],
        current: stack.at(-1),
        currentPath: [...stack],
        currentEdge,
        ...(returnTo ? { returnTo } : {}),
      },
      state
    );
  }

  function traverse(nodeId: string, parent?: string): void {
    stack.push(nodeId);
    emit("PUSH", nodeId, "push", parent ? { source: parent, target: nodeId } : undefined);

    visited.add(nodeId);
    visitedOrder.push(nodeId);
    emit("VISIT", nodeId, "visit", parent ? { source: parent, target: nodeId } : undefined);

    for (const neighbor of graph.getNeighbors(nodeId)) {
      if (!visited.has(neighbor.nodeId)) {
        traverse(neighbor.nodeId, nodeId);
      }
    }

    stack.pop();
    emit(
      "BACKTRACK",
      nodeId,
      "backtrack",
      parent ? { source: nodeId, target: parent } : undefined,
      parent
    );
  }

  traverse(startNodeId);

  observer?.emit(
    "COMPLETE",
    {
      visited: [...visitedOrder],
      traversalOrder: [...visitedOrder],
      stack: [],
      currentPath: [],
      phase: "complete",
    },
    {
      visited: [...visitedOrder],
      stack: [],
      traversalOrder: [...visitedOrder],
      current: undefined,
      currentPath: [],
      phase: "complete",
    } satisfies DfsTraceState
  );

  return { visitedOrder };
}

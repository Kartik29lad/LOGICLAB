import type { ExecutionTraceStep } from "@/contracts/events/trace-events";
import type { GraphVisualState, VisualizationState } from "@/contracts/events/visualization-state";
import type { ExecutionMetrics } from "@/contracts/execution";

import { deriveBfsStepView } from "./bfs-visualization";
import { deriveDfsStepView } from "./dfs-visualization";
import { toGraphVisualizationState } from "./render-state-adapters";

export function graphState(
  slug: string,
  step: ExecutionTraceStep,
  metrics: ExecutionMetrics,
  status: VisualizationState["status"]
): GraphVisualState {
  const state = step.stateAfter as {
    nodes?: Array<string | { id?: string; label?: string; x?: number; y?: number }>;
    edges?: Array<string[] | { source?: string; target?: string; weight?: number }>;
    directed?: boolean;
    visited?: string[];
    current?: string;
    distances?: Record<string, number>;
    parents?: Record<string, string | undefined>;
  };
  const fallbackNodes = ["A", "B", "C", "D", "E"];
  const rawNodes = state.nodes ?? fallbackNodes;
  const nodes = rawNodes.map((node, i) => {
    if (typeof node === "string")
      return { id: node, label: node, x: 90 + (i % 3) * 220, y: 80 + Math.floor(i / 3) * 150 };
    const id = node.id ?? `N${i + 1}`;
    return {
      id,
      label: node.label ?? id,
      x: node.x ?? 90 + (i % 3) * 220,
      y: node.y ?? 80 + Math.floor(i / 3) * 150,
    };
  });
  const edges = (
    state.edges ?? [
      ["A", "B"],
      ["A", "C"],
      ["B", "D"],
      ["C", "D"],
      ["D", "E"],
    ]
  ).flatMap((edge) => {
    if (Array.isArray(edge))
      return edge.length >= 2
        ? [{ source: String(edge[0]), target: String(edge[1]), weight: 1 }]
        : [];
    if (typeof edge === "object" && edge !== null)
      return [
        {
          source: String(edge.source ?? ""),
          target: String(edge.target ?? ""),
          weight: edge.weight ?? 1,
        },
      ];
    return [];
  });
  if (
    slug === "bfs" &&
    (step.event.type === "ENQUEUE" || step.event.type === "DEQUEUE" || step.event.type === "VISIT")
  ) {
    const bfs = deriveBfsStepView(step);
    const activeEdges = bfs.currentEdge
      ? [`${bfs.currentEdge.source}->${bfs.currentEdge.target}`]
      : [];
    return toGraphVisualizationState(
      {
        nodes,
        edges,
        directed: Boolean(state.directed),
        algorithmMode: "bfs",
        visitedNodes: bfs.visited,
        discoveredNodes: bfs.discovered,
        currentNode: bfs.current,
        distances: bfs.distances,
        parents: bfs.parents,
        activeEdges,
        queueState: bfs.queue,
        traversalOrder: bfs.traversalOrder,
        currentEdge: bfs.currentEdge,
        algorithmPhase: bfs.phase,
      },
      step.stepIndex,
      metrics,
      status
    );
  }

  if (
    slug === "dfs" &&
    (step.event.type === "PUSH" ||
      step.event.type === "VISIT" ||
      step.event.type === "BACKTRACK" ||
      step.event.type === "COMPLETE")
  ) {
    const dfs = deriveDfsStepView(step);
    const activeEdges = dfs.currentEdge
      ? [
          `${dfs.currentEdge.source}->${dfs.currentEdge.target}`,
          `${dfs.currentEdge.target}->${dfs.currentEdge.source}`,
        ]
      : [];
    return toGraphVisualizationState(
      {
        nodes,
        edges,
        directed: Boolean(state.directed),
        algorithmMode: "dfs",
        visitedNodes: dfs.visited,
        discoveredNodes: dfs.stack,
        currentNode: dfs.current,
        activeEdges,
        traversalOrder: dfs.traversalOrder,
        currentEdge: dfs.currentEdge,
        algorithmPhase: dfs.phase,
        stackState: dfs.stack,
        currentPath: dfs.currentPath,
      },
      step.stepIndex,
      metrics,
      status
    );
  }
  const payload = (step.event.payload ?? {}) as Record<string, unknown>;
  const visited = Array.isArray(payload.visited)
    ? payload.visited.filter((x): x is string => typeof x === "string")
    : (state.visited ?? []);
  const current = typeof payload.node === "string" ? payload.node : state.current;
  const target = typeof payload.target === "string" ? payload.target : undefined;
  const path = Array.isArray(payload.path)
    ? payload.path.filter((x): x is string => typeof x === "string")
    : [];
  const distances = isNumberRecord(payload.distances) ? payload.distances : (state.distances ?? {});
  const parents = isStringRecord(payload.parents) ? payload.parents : (state.parents ?? {});
  const activeEdges = [] as string[];
  if (typeof payload.from === "string" && typeof payload.to === "string")
    activeEdges.push(`${payload.from}->${payload.to}`);
  if (slug === "dijkstra") {
    return toGraphVisualizationState(
      {
        nodes,
        edges,
        directed: Boolean(state.directed),
        algorithmMode: "dijkstra",
        visitedNodes: visited,
        discoveredNodes: visited,
        currentNode: current,
        targetNode: target,
        path,
        distances,
        parents,
        activeEdges,
        currentEdge:
          typeof payload.from === "string" && typeof payload.to === "string"
            ? { source: payload.from, target: payload.to }
            : undefined,
      },
      step.stepIndex,
      metrics,
      status
    );
  }

  if (slug === "a-star") {
    const aState = isRecord(step.stateAfter) ? step.stateAfter : {};
    const openSet = stringArray(aState.openSet) || stringArray(payload.openSet) || [];
    const closedSet = stringArray(aState.closedSet) || stringArray(payload.closedSet) || [];
    const gScore = isNumberRecord(aState.gScore) ? aState.gScore : {};
    const hScore = isNumberRecord(aState.hScore) ? aState.hScore : {};
    const fScore = isNumberRecord(aState.fScore) ? aState.fScore : {};
    const aParents = isStringRecord(aState.parents) ? aState.parents : parents;
    const aPath = stringArray(aState.path) || path;
    return toGraphVisualizationState(
      {
        nodes,
        edges,
        directed: Boolean(state.directed),
        algorithmMode: "a-star",
        visitedNodes: closedSet,
        discoveredNodes: openSet,
        currentNode: typeof aState.current === "string" ? aState.current : current,
        targetNode: typeof aState.target === "string" ? aState.target : target,
        path: aPath,
        distances: gScore,
        parents: aParents,
        activeEdges,
        currentEdge:
          typeof payload.from === "string" && typeof payload.to === "string"
            ? { source: payload.from, target: payload.to }
            : undefined,
        heuristic: hScore,
        fScores: fScore,
        openSet,
        closedSet,
      },
      step.stepIndex,
      metrics,
      status
    );
  }
  return toGraphVisualizationState(
    {
      nodes,
      edges,
      directed: Boolean(state.directed),
      visitedNodes: visited,
      currentNode: current,
      targetNode: target,
      path,
      distances,
      parents,
      activeEdges,
    },
    step.stepIndex,
    metrics,
    status
  );
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => typeof item === "number")
  );
}

function isStringRecord(value: unknown): value is Record<string, string | undefined> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => typeof item === "string" || item === undefined)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : undefined;
}

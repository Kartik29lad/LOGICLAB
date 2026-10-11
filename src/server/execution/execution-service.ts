import { randomUUID } from "node:crypto";

import { ALGORITHM_CATALOG, hasAlgorithmImplementation } from "../../core/algorithms/catalog";
import type { AlgorithmStepObserver } from "../../core/algorithms/contracts/algorithm-observer";
import { Graph } from "../../core/graph/models/graph";
import { aStar } from "../../core/graph/pathfinding/a-star";
import { dijkstra } from "../../core/graph/pathfinding/dijkstra";
import { breadthFirstSearch } from "../../core/graph/traversal/bfs";
import { depthFirstSearch } from "../../core/graph/traversal/dfs";
import { ResourceLimitError, ValidationError } from "../../errors";

export interface ExecuteRequest {
  algorithmSlug: string;
  input: unknown;
  target?: number;
  startNodeId?: string;
  targetNodeId?: string;
  maxSteps?: number;
}

export interface ExecuteResponse {
  executionId: string;
  algorithmSlug: string;
  input: unknown;
  output: unknown;
  events: Array<{ stepIndex: number; type: string; payload?: unknown; stateAfter?: unknown }>;
  metrics: {
    comparisons: number;
    swaps: number;
    reads: number;
    writes: number;
    visits: number;
    iterations: number;
    elapsedMs: number;
  };
  status: "completed";
}

const DEFAULT_MAX_STEPS = 10_000;
const MAX_STEPS = 25_000;
const MAX_ARRAY = 5_000;
const MAX_GRAPH_NODES = 200;
const MAX_GRAPH_EDGES = 1_000;

export function executeAlgorithm(request: ExecuteRequest): ExecuteResponse {
  if (!hasAlgorithmImplementation(request.algorithmSlug))
    throw new ValidationError("Unknown algorithm.");
  const maxSteps = clampInteger(request.maxSteps ?? DEFAULT_MAX_STEPS, 1, MAX_STEPS);
  const events: ExecuteResponse["events"] = [];
  const started = performance.now();
  let comparisons = 0;
  let swaps = 0;
  let reads = 0;
  let writes = 0;
  let visits = 0;
  let iterations = 0;

  const observer: AlgorithmStepObserver = {
    emit(type, payload, stateAfter) {
      if (events.length >= maxSteps)
        throw new ResourceLimitError(`Execution exceeded the ${maxSteps}-step limit.`);
      const stepIndex = events.length;
      events.push({ stepIndex, type, payload, stateAfter });
      iterations += 1;
      if (type === "COMPARE") comparisons += 1;
      if (type === "SWAP") swaps += 1;
      if (type === "READ") reads += 1;
      if (type === "WRITE") writes += 1;
      if (type === "VISIT") visits += 1;
    },
  };

  let output: unknown;
  const slug = request.algorithmSlug;
  if (
    [
      "bubble-sort",
      "insertion-sort",
      "selection-sort",
      "merge-sort",
      "quick-sort",
      "heap-sort",
      "linear-search",
      "binary-search",
    ].includes(slug)
  ) {
    const array = readNumberArray(request.input);
    if (slug.endsWith("search")) {
      if (!Number.isFinite(request.target))
        throw new ValidationError("target is required for search algorithms.");
      const searchImplementation =
        slug === "linear-search"
          ? ALGORITHM_CATALOG["linear-search"].implementation
          : ALGORITHM_CATALOG["binary-search"].implementation;
      output = searchImplementation(array, request.target as number, observer);
    } else {
      switch (slug) {
        case "bubble-sort":
          output = ALGORITHM_CATALOG["bubble-sort"].implementation(array, observer);
          break;
        case "insertion-sort":
          output = ALGORITHM_CATALOG["insertion-sort"].implementation(array, observer);
          break;
        case "selection-sort":
          output = ALGORITHM_CATALOG["selection-sort"].implementation(array, observer);
          break;
        case "merge-sort":
          output = ALGORITHM_CATALOG["merge-sort"].implementation(array, observer);
          break;
        case "quick-sort":
          output = ALGORITHM_CATALOG["quick-sort"].implementation(array, observer);
          break;
        case "heap-sort":
          output = ALGORITHM_CATALOG["heap-sort"].implementation(array, observer);
          break;
        default:
          throw new ValidationError("Unsupported sorting algorithm.");
      }
    }
  } else {
    const graphInput = readGraphInput(request.input);
    const graph = new Graph(graphInput.directed);
    for (const node of graphInput.nodes) graph.addNode(node.id, node.label, node.x, node.y);
    for (const edge of graphInput.edges) graph.addEdge(edge.source, edge.target, edge.weight);
    const start = request.startNodeId ?? graphInput.nodes[0]?.id;
    if (!start) throw new ValidationError("A graph execution requires a start node.");
    if (slug === "bfs") output = breadthFirstSearch(graph, start, observer);
    else if (slug === "dfs") output = depthFirstSearch(graph, start, observer);
    else if (slug === "dijkstra") output = dijkstra(graph, start, observer);
    else if (slug === "a-star") {
      const target = request.targetNodeId;
      if (!target) throw new ValidationError("A* requires targetNodeId.");
      output = aStar(graph, start, target, undefined, observer);
    } else throw new ValidationError("Unsupported algorithm.");
  }

  return {
    executionId: randomUUID(),
    algorithmSlug: slug,
    input: request.input,
    output: sanitizeOutput(output),
    events,
    metrics: {
      comparisons,
      swaps,
      reads,
      writes,
      visits,
      iterations,
      elapsedMs: Math.round((performance.now() - started) * 100) / 100,
    },
    status: "completed",
  };
}

function readNumberArray(value: unknown): number[] {
  if (
    !Array.isArray(value) ||
    value.length > MAX_ARRAY ||
    value.some((item) => typeof item !== "number" || !Number.isFinite(item))
  )
    throw new ValidationError(`Input must be an array of at most ${MAX_ARRAY} finite numbers.`);
  return [...value];
}

function readGraphInput(value: unknown): {
  directed: boolean;
  nodes: Array<{ id: string; label: string; x?: number; y?: number }>;
  edges: Array<{ source: string; target: string; weight: number }>;
} {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new ValidationError("Graph input must be an object.");
  const raw = value as Record<string, unknown>;
  if (
    !Array.isArray(raw.nodes) ||
    raw.nodes.length > MAX_GRAPH_NODES ||
    !Array.isArray(raw.edges) ||
    raw.edges.length > MAX_GRAPH_EDGES
  )
    throw new ValidationError(
      `Graph input is limited to ${MAX_GRAPH_NODES} nodes and ${MAX_GRAPH_EDGES} edges.`
    );
  const nodes = raw.nodes.map((node) => {
    if (typeof node !== "object" || node === null) throw new ValidationError("Invalid graph node.");
    const n = node as Record<string, unknown>;
    if (typeof n.id !== "string" || !n.id.trim())
      throw new ValidationError("Graph node id is required.");
    return {
      id: n.id.trim(),
      label: typeof n.label === "string" ? n.label : n.id.trim(),
      x: typeof n.x === "number" ? n.x : undefined,
      y: typeof n.y === "number" ? n.y : undefined,
    };
  });
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = raw.edges.map((edge) => {
    if (typeof edge !== "object" || edge === null) throw new ValidationError("Invalid graph edge.");
    const e = edge as Record<string, unknown>;
    const weight = e.weight === undefined ? 1 : e.weight;
    if (
      typeof e.source !== "string" ||
      typeof e.target !== "string" ||
      typeof weight !== "number" ||
      !Number.isFinite(weight) ||
      weight < 0 ||
      !nodeIds.has(e.source) ||
      !nodeIds.has(e.target)
    )
      throw new ValidationError("Graph edge has invalid endpoints or weight.");
    return { source: e.source, target: e.target, weight };
  });
  return { directed: raw.directed === true, nodes, edges };
}

function clampInteger(value: unknown, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max)
    throw new ValidationError(`Value must be an integer between ${min} and ${max}.`);
  return parsed;
}

function sanitizeOutput(value: unknown): unknown {
  if (typeof value === "function") return undefined;
  if (value && typeof value === "object") {
    if (Array.isArray(value)) return value.map(sanitizeOutput);
    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value))
      if (typeof child !== "function") result[key] = sanitizeOutput(child);
    return result;
  }
  return value;
}

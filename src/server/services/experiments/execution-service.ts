import type { AlgorithmStepObserver } from "@/core/algorithms/contracts/algorithm-observer";
import {
  binarySearch,
  bubbleSort,
  heapSort,
  insertionSort,
  linearSearch,
  mergeSort,
  quickSort,
  selectionSort,
} from "@/core/algorithms/implementations";
import type { ComparisonAlgorithmResult } from "@/core/comparison";
import { aStar, breadthFirstSearch, depthFirstSearch, dijkstra, Graph } from "@/core/graph";

const SORTS: Record<
  string,
  {
    name: string;
    run: (input: number[], observer: AlgorithmStepObserver) => unknown;
    complexity: ComparisonAlgorithmResult["complexity"];
  }
> = {
  "bubble-sort": {
    name: "Bubble Sort",
    run: bubbleSort,
    complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  },
  "insertion-sort": {
    name: "Insertion Sort",
    run: insertionSort,
    complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  },
  "selection-sort": {
    name: "Selection Sort",
    run: selectionSort,
    complexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  },
  "merge-sort": {
    name: "Merge Sort",
    run: mergeSort,
    complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)" },
  },
  "quick-sort": {
    name: "Quick Sort",
    run: quickSort,
    complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)", space: "O(log n)" },
  },
  "heap-sort": {
    name: "Heap Sort",
    run: heapSort,
    complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(1)" },
  },
};

const SEARCHES: Record<
  string,
  {
    name: string;
    run: (input: number[], target: number, observer: AlgorithmStepObserver) => unknown;
    complexity: ComparisonAlgorithmResult["complexity"];
  }
> = {
  "linear-search": {
    name: "Linear Search",
    run: linearSearch,
    complexity: { best: "O(1)", average: "O(n)", worst: "O(n)", space: "O(1)" },
  },
  "binary-search": {
    name: "Binary Search",
    run: binarySearch,
    complexity: { best: "O(1)", average: "O(log n)", worst: "O(log n)", space: "O(1)" },
  },
};

const GRAPHS: Record<
  string,
  { name: string; complexity: ComparisonAlgorithmResult["complexity"] }
> = {
  bfs: {
    name: "Breadth-First Search",
    complexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)", space: "O(V)" },
  },
  dfs: {
    name: "Depth-First Search",
    complexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)", space: "O(V)" },
  },
  dijkstra: {
    name: "Dijkstra",
    complexity: { best: "O(V² + E)", average: "O(V² + E)", worst: "O(V² + E)", space: "O(V)" },
  },
  "a-star": {
    name: "A*",
    complexity: { best: "O(E)", average: "O(E log V)", worst: "O(V² + E)", space: "O(V)" },
  },
};

export function runAlgorithm(slug: string, input: unknown): ComparisonAlgorithmResult {
  const events: Array<{ type: string }> = [];
  const observer: AlgorithmStepObserver = { emit: (type) => events.push({ type }) };
  const started = performance.now();
  let result: unknown;
  let complexity: ComparisonAlgorithmResult["complexity"];
  let name: string;
  const normalized = normalizeArray(input);

  if (SORTS[slug]) {
    const definition = SORTS[slug];
    name = definition.name;
    complexity = definition.complexity;
    result = definition.run(normalized, observer);
  } else if (SEARCHES[slug]) {
    const definition = SEARCHES[slug];
    name = definition.name;
    complexity = definition.complexity;
    result = definition.run(normalized, resolveTarget(input), observer);
  } else if (GRAPHS[slug]) {
    const definition = GRAPHS[slug];
    name = definition.name;
    complexity = definition.complexity;
    result = runGraph(slug, input, observer);
  } else {
    throw new Error(`Unsupported experiment algorithm: ${slug}`);
  }

  const durationMs = performance.now() - started;
  const eventCounts = events.reduce<Record<string, number>>((counts, event) => {
    counts[event.type] = (counts[event.type] ?? 0) + 1;
    return counts;
  }, {});
  const typed = result as {
    metrics?: Record<string, number>;
    visitedNodes?: string[];
    cost?: number;
  };
  return {
    slug,
    name,
    result,
    metrics: {
      ...typed.metrics,
      visitedNodes: typed.visitedNodes?.length,
      pathCost: Number.isFinite(typed.cost) ? typed.cost : undefined,
      steps: events.length,
      durationMs,
      ...eventCounts,
    },
    complexity,
  };
}

export function runComparison(slugs: string[], input: unknown): ComparisonAlgorithmResult[] {
  if (slugs.length < 2 || slugs.length > 6) throw new Error("Select between 2 and 6 algorithms.");
  return slugs.map((slug) => runAlgorithm(slug, input));
}

function normalizeArray(input: unknown): number[] {
  const values = Array.isArray(input)
    ? input
    : typeof input === "object" &&
        input !== null &&
        Array.isArray((input as { values?: unknown }).values)
      ? (input as { values: unknown[] }).values
      : [];
  if (
    !values.length ||
    values.length > 5000 ||
    values.some((value) => typeof value !== "number" || !Number.isFinite(value))
  )
    throw new Error("Input must contain 1-5000 finite numbers.");
  return values.map(Number);
}

function resolveTarget(input: unknown): number {
  if (
    typeof input === "object" &&
    input !== null &&
    typeof (input as { target?: unknown }).target === "number"
  )
    return (input as { target: number }).target;
  throw new Error("Search experiments require a numeric target.");
}

function runGraph(slug: string, input: unknown, observer: AlgorithmStepObserver): unknown {
  const data = input as {
    directed?: boolean;
    nodes?: Array<{ id: string; label?: string; x?: number; y?: number }>;
    edges?: Array<{ source: string; target: string; weight?: number }>;
    start?: string;
    target?: string;
  };
  if (
    !Array.isArray(data.nodes) ||
    !Array.isArray(data.edges) ||
    data.nodes.length > 200 ||
    data.edges.length > 1000
  )
    throw new Error("Graph input is invalid or exceeds limits.");
  const graph = new Graph(Boolean(data.directed));
  data.nodes.forEach((node) => graph.addNode(node.id, node.label ?? node.id, node.x, node.y));
  data.edges.forEach((edge) => graph.addEdge(edge.source, edge.target, edge.weight ?? 1));
  if (!data.start || !graph.hasNode(data.start)) throw new Error("Graph start node is required.");
  if (slug === "bfs") return breadthFirstSearch(graph, data.start, observer);
  if (slug === "dfs") return depthFirstSearch(graph, data.start, observer);
  if (!data.target || !graph.hasNode(data.target))
    throw new Error("This graph algorithm requires a target node.");
  if (slug === "dijkstra") return dijkstra(graph, data.start, observer);
  return aStar(graph, data.start, data.target, undefined, observer);
}

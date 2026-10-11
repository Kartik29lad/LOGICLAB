import type { CanonicalExecutionTrace } from "@/contracts/events/trace-events";

import { createGraphTrace } from "./demo-traces-graph";
import {
  ArrayTraceOptions,
  buildTrace,
  createHashTableTrace,
  createHeapTrace,
  createLinearTrace,
  createObserver,
  TraceEvent,
} from "./demo-traces-specialized";
import { createTreeTrace, DEFAULT_TREE_EXPERIMENT } from "./tree-laboratory";

export type { ArrayTraceOptions } from "./demo-traces-specialized";

const ARRAY_INPUT = [7, 3, 9, 2, 5];
const SEARCH_INPUT = [2, 5, 7, 9, 13, 18, 21];

export async function createDemoTrace(
  slug: string,
  options: ArrayTraceOptions = {}
): Promise<CanonicalExecutionTrace<unknown, unknown, unknown>> {
  if (["bfs", "dfs", "dijkstra", "a-star"].includes(slug))
    return createGraphTrace(slug, options.graph);
  if (slug === "binary-search-tree")
    return createTreeTrace(options.tree ?? DEFAULT_TREE_EXPERIMENT);
  if (slug === "stack" || slug === "queue" || slug === "linked-list")
    return createLinearTrace(slug, options);
  if (slug === "hash-table") return createHashTableTrace(options);
  if (slug === "heap") return createHeapTrace(options);
  return createArrayTrace(slug, options);
}

async function createArrayTrace(
  slug: string,
  options: ArrayTraceOptions = {}
): Promise<CanonicalExecutionTrace<unknown, unknown, unknown>> {
  const fallback =
    slug === "linear-search" || slug === "binary-search" ? SEARCH_INPUT : ARRAY_INPUT;
  const values = options.array ? [...options.array] : [...fallback];
  const target = options.target ?? 9;
  const events: TraceEvent[] = [];
  const observer = createObserver(events);
  let output: unknown;

  if (slug === "linear-search") {
    const { linearSearch } =
      await import("@/core/algorithms/implementations/searching/linear-search/linear-search");
    output = linearSearch(values, target, observer);
  } else if (slug === "binary-search") {
    const { binarySearch } =
      await import("@/core/algorithms/implementations/searching/binary-search/binary-search");
    output = binarySearch(values, target, observer);
  } else {
    const modules: Record<string, () => Promise<unknown>> = {
      "bubble-sort": () =>
        import("@/core/algorithms/implementations/sorting/bubble-sort/bubble-sort").then(
          (m) => m.bubbleSort
        ),
      "insertion-sort": () =>
        import("@/core/algorithms/implementations/sorting/insertion-sort/insertion-sort").then(
          (m) => m.insertionSort
        ),
      "selection-sort": () =>
        import("@/core/algorithms/implementations/sorting/selection-sort/selection-sort").then(
          (m) => m.selectionSort
        ),
      "merge-sort": () =>
        import("@/core/algorithms/implementations/sorting/merge-sort/merge-sort").then(
          (m) => m.mergeSort
        ),
      "quick-sort": () =>
        import("@/core/algorithms/implementations/sorting/quick-sort/quick-sort").then(
          (m) => m.quickSort
        ),
      "heap-sort": () =>
        import("@/core/algorithms/implementations/sorting/heap-sort/heap-sort").then(
          (m) => m.heapSort
        ),
    };
    const algorithm = (await (modules[slug]?.() ?? modules["bubble-sort"]())) as (
      input: readonly number[],
      observer?: { emit: (...args: never[]) => void }
    ) => unknown;
    output = algorithm(values, observer);
  }
  return buildTrace(slug, values, output, events, [...values]);
}

import { aStar } from "../graph/pathfinding/a-star";
import { dijkstra } from "../graph/pathfinding/dijkstra";
import { breadthFirstSearch } from "../graph/traversal/bfs";
import { depthFirstSearch } from "../graph/traversal/dfs";
import {
  BINARY_SEARCH_METADATA,
  binarySearch,
} from "./implementations/searching/binary-search/binary-search";
import {
  LINEAR_SEARCH_METADATA,
  linearSearch,
} from "./implementations/searching/linear-search/linear-search";
import {
  BUBBLE_SORT_METADATA,
  bubbleSort,
} from "./implementations/sorting/bubble-sort/bubble-sort";
import { HEAP_SORT_METADATA, heapSort } from "./implementations/sorting/heap-sort/heap-sort";
import {
  INSERTION_SORT_METADATA,
  insertionSort,
} from "./implementations/sorting/insertion-sort/insertion-sort";
import { MERGE_SORT_METADATA, mergeSort } from "./implementations/sorting/merge-sort/merge-sort";
import { QUICK_SORT_METADATA, quickSort } from "./implementations/sorting/quick-sort/quick-sort";
import {
  SELECTION_SORT_METADATA,
  selectionSort,
} from "./implementations/sorting/selection-sort/selection-sort";

export const ALGORITHM_CATALOG = {
  "bubble-sort": { implementation: bubbleSort, metadata: BUBBLE_SORT_METADATA },
  "insertion-sort": { implementation: insertionSort, metadata: INSERTION_SORT_METADATA },
  "selection-sort": { implementation: selectionSort, metadata: SELECTION_SORT_METADATA },
  "merge-sort": { implementation: mergeSort, metadata: MERGE_SORT_METADATA },
  "quick-sort": { implementation: quickSort, metadata: QUICK_SORT_METADATA },
  "heap-sort": { implementation: heapSort, metadata: HEAP_SORT_METADATA },
  "linear-search": { implementation: linearSearch, metadata: LINEAR_SEARCH_METADATA },
  "binary-search": { implementation: binarySearch, metadata: BINARY_SEARCH_METADATA },
  bfs: {
    implementation: breadthFirstSearch,
    metadata: { slug: "bfs", name: "Breadth-First Search" },
  },
  dfs: { implementation: depthFirstSearch, metadata: { slug: "dfs", name: "Depth-First Search" } },
  dijkstra: { implementation: dijkstra, metadata: { slug: "dijkstra", name: "Dijkstra" } },
  "a-star": { implementation: aStar, metadata: { slug: "a-star", name: "A*" } },
} as const;

export type AlgorithmCatalogSlug = keyof typeof ALGORITHM_CATALOG;
export const INITIAL_ALGORITHM_SLUGS = Object.keys(ALGORITHM_CATALOG) as AlgorithmCatalogSlug[];

export function hasAlgorithmImplementation(slug: string): slug is AlgorithmCatalogSlug {
  return slug in ALGORITHM_CATALOG;
}

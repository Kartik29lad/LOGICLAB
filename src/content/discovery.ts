import { content as aStar } from "./algorithms/graphs/a-star/content";
import { content as bfs } from "./algorithms/graphs/bfs/content";
import { content as dfs } from "./algorithms/graphs/dfs/content";
import { content as dijkstra } from "./algorithms/graphs/dijkstra/content";
import { content as binarySearch } from "./algorithms/searching/binary-search/content";
import { content as linearSearch } from "./algorithms/searching/linear-search/content";
import { content as bubbleSort } from "./algorithms/sorting/bubble-sort/content";
import { content as heapSort } from "./algorithms/sorting/heap-sort/content";
import { content as insertionSort } from "./algorithms/sorting/insertion-sort/content";
import { content as mergeSort } from "./algorithms/sorting/merge-sort/content";
import { content as quickSort } from "./algorithms/sorting/quick-sort/content";
import { content as selectionSort } from "./algorithms/sorting/selection-sort/content";
import { content as array } from "./data-structures/array/content";
import { content as binarySearchTree } from "./data-structures/binary-search-tree/content";
import { content as graph } from "./data-structures/graph/content";
import { content as hashTable } from "./data-structures/hash-table/content";
import { content as heap } from "./data-structures/heap/content";
import { content as linkedList } from "./data-structures/linked-list/content";
import { content as queue } from "./data-structures/queue/content";
import { content as stack } from "./data-structures/stack/content";
import { content as tree } from "./data-structures/tree/content";
import { content as trie } from "./data-structures/trie/content";
import { content as foundations } from "./learning-paths/foundations/content";
import { content as graphAlgorithms } from "./learning-paths/graph-algorithms/content";
import { content as sortingMastery } from "./learning-paths/sorting-mastery/content";
import type { ContentPackage, Difficulty, SourceContentType } from "./schema/content-types";

export const DISCOVERY_CONTENT: readonly ContentPackage[] = [
  bubbleSort,
  insertionSort,
  selectionSort,
  mergeSort,
  quickSort,
  heapSort,
  linearSearch,
  binarySearch,
  bfs,
  dfs,
  dijkstra,
  aStar,
  array,
  stack,
  queue,
  linkedList,
  heap,
  hashTable,
  tree,
  binarySearchTree,
  trie,
  graph,
  foundations,
  sortingMastery,
  graphAlgorithms,
];

export type DiscoveryType = Extract<SourceContentType, "ALGORITHM" | "DATA_STRUCTURE">;

export const DISCOVERY_DIFFICULTIES: readonly Difficulty[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
];

export const DISCOVERY_CATEGORIES = [
  ...new Set(DISCOVERY_CONTENT.map((item) => item.metadata.category)),
].sort();

export function getDiscoveryContent(type: DiscoveryType): ContentPackage[] {
  return DISCOVERY_CONTENT.filter((item) => item.metadata.type === type);
}

export function getDiscoveryItem(slug: string, type?: DiscoveryType): ContentPackage | undefined {
  return DISCOVERY_CONTENT.find(
    (item) => item.metadata.slug === slug && (!type || item.metadata.type === type)
  );
}

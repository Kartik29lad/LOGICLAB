export interface ContentCategory {
  id: string;
  name: string;
  description: string;
  algorithmIds: string[];
  dataStructureIds: string[];
  learningOrder: number;
}

export const INITIAL_CONTENT_CATEGORIES: readonly ContentCategory[] = [
  {
    id: "sorting",
    name: "Sorting",
    description: "Algorithms that reorder values according to an ordering rule.",
    algorithmIds: [
      "bubble-sort",
      "insertion-sort",
      "selection-sort",
      "merge-sort",
      "quick-sort",
      "heap-sort",
    ],
    dataStructureIds: ["array", "heap"],
    learningOrder: 1,
  },
  {
    id: "searching",
    name: "Searching",
    description: "Algorithms that locate values or narrow a search space.",
    algorithmIds: ["linear-search", "binary-search"],
    dataStructureIds: ["array", "hash-table"],
    learningOrder: 2,
  },
  {
    id: "graphs",
    name: "Graphs",
    description: "Algorithms and structures for connected relationships and paths.",
    algorithmIds: ["bfs", "dfs", "dijkstra", "a-star"],
    dataStructureIds: ["graph"],
    learningOrder: 3,
  },
  {
    id: "trees",
    name: "Trees",
    description: "Hierarchical structures and algorithms.",
    algorithmIds: [],
    dataStructureIds: ["tree", "binary-search-tree", "trie"],
    learningOrder: 4,
  },
  {
    id: "data-structures",
    name: "Data Structures",
    description: "Reusable structures for organizing and accessing data.",
    algorithmIds: [],
    dataStructureIds: ["stack", "queue", "linked-list", "heap", "hash-table"],
    learningOrder: 5,
  },
];

export function getInitialCategory(id: string): ContentCategory | undefined {
  return INITIAL_CONTENT_CATEGORIES.find((category) => category.id === id);
}

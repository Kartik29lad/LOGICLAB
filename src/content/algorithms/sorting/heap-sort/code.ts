import type { CodeReference } from "../../../schema/content-types";

export const code: CodeReference[] = [
  {
    language: "typescript",
    entryPoint: "heap-sort",
    source:
      'import type { AlgorithmMetadata, SortResult } from "../../../contracts/algorithm.types";\n\nexport const HEAP_SORT_METADATA: AlgorithmMetadata = {\n  id: "sorting-heap-sort",\n  slug: "heap-sort",\n  name: "Heap Sort",\n  category: "sorting",\n  description:\n    "Converts the array into a max-heap, repeatedly extracts the maximum element to the sorted partition, and restores the heap property.",\n  complexity: {\n    time: {\n      best: "O(n log n)",\n      average: "O(n log n)",\n      worst: "O(n log n)",\n    },\n    space: "O(1)",\n    isStable: false,\n    isInPlace: true,\n  },\n};\n\n/**\n * Pure Heap Sort.\n */\nexport function heapSort(input: readonly number[]): SortResult<number> {\n  const array = [...input];\n  let comparisons = 0;\n  let swaps = 0;\n  const n = array.length;\n\n  function heapify(size: number, rootIdx: number): void {\n    let largest = rootIdx;\n    const left = 2 * rootIdx + 1;\n    const right = 2 * rootIdx + 2;\n\n    if (left < size) {\n      comparisons++;\n      if (array[left]! > array[largest]!) {\n        largest = left;\n      }\n    }\n\n    if (right < size) {\n      comparisons++;\n      if (array[right]! > array[largest]!) {\n        largest = right;\n      }\n    }\n\n    if (largest !== rootIdx) {\n      const temp = array[rootIdx]!;\n      array[rootIdx] = array[largest]!;\n      array[largest] = temp;\n      swaps++;\n\n      heapify(size, largest);\n    }\n  }\n\n  // Build max heap\n  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {\n    heapify(n, i);\n  }\n\n  // Extract elements one by one from heap\n  for (let i = n - 1; i > 0; i--) {\n    const temp = array[0]!;\n    array[0] = array[i]!;\n    array[i] = temp;\n    swaps++;\n\n    heapify(i, 0);\n  }\n\n  return {\n    sorted: array,\n    metrics: { comparisons, swaps },\n  };\n}\n',
    stepMappings: [{ action: "MAIN", startLine: 1, endLine: 80 }],
  },
];

import type { CodeReference } from "../../../schema/content-types";

export const code: CodeReference[] = [
  {
    language: "typescript",
    entryPoint: "quick-sort",
    source:
      'import type { AlgorithmMetadata, SortResult } from "../../../contracts/algorithm.types";\n\nexport const QUICK_SORT_METADATA: AlgorithmMetadata = {\n  id: "sorting-quick-sort",\n  slug: "quick-sort",\n  name: "Quick Sort",\n  category: "sorting",\n  description:\n    "Selects a pivot element and partitions the array into values smaller and larger than the pivot, recursively sorting each side.",\n  complexity: {\n    time: {\n      best: "O(n log n)",\n      average: "O(n log n)",\n      worst: "O(n^2)",\n    },\n    space: "O(log n) average; O(n) worst-case",\n    isStable: false,\n    isInPlace: true,\n  },\n};\n\n/**\n * Pure Quick Sort using Lomuto partition scheme.\n */\nexport function quickSort(input: readonly number[]): SortResult<number> {\n  const array = [...input];\n  let comparisons = 0;\n  let swaps = 0;\n\n  function sort(low: number, high: number): void {\n    if (low < high) {\n      const pi = partition(low, high);\n      sort(low, pi - 1);\n      sort(pi + 1, high);\n    }\n  }\n\n  function partition(low: number, high: number): number {\n    const pivot = array[high]!;\n    let i = low - 1;\n\n    for (let j = low; j < high; j++) {\n      comparisons++;\n      if (array[j]! <= pivot) {\n        i++;\n        const temp = array[i]!;\n        array[i] = array[j]!;\n        array[j] = temp;\n        swaps++;\n      }\n    }\n\n    const temp = array[i + 1]!;\n    array[i + 1] = array[high]!;\n    array[high] = temp;\n    swaps++;\n\n    return i + 1;\n  }\n\n  if (array.length > 1) {\n    sort(0, array.length - 1);\n  }\n\n  return {\n    sorted: array,\n    metrics: { comparisons, swaps },\n  };\n}\n',
    stepMappings: [{ action: "MAIN", startLine: 1, endLine: 70 }],
  },
];

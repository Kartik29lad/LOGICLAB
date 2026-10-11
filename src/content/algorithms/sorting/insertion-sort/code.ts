import type { CodeReference } from "../../../schema/content-types";

export const code: CodeReference[] = [
  {
    language: "typescript",
    entryPoint: "insertion-sort",
    source:
      'import type { AlgorithmMetadata, SortResult } from "../../../contracts/algorithm.types";\n\nexport const INSERTION_SORT_METADATA: AlgorithmMetadata = {\n  id: "sorting-insertion-sort",\n  slug: "insertion-sort",\n  name: "Insertion Sort",\n  category: "sorting",\n  description:\n    "Builds the final sorted array one item at a time, shifting larger elements to the right to insert each item.",\n  complexity: {\n    time: {\n      best: "O(n)",\n      average: "O(n^2)",\n      worst: "O(n^2)",\n    },\n    space: "O(1)",\n    isStable: true,\n    isInPlace: true,\n  },\n};\n\n/**\n * Pure Insertion Sort.\n */\nexport function insertionSort(input: readonly number[]): SortResult<number> {\n  const array = [...input];\n  let comparisons = 0;\n  let swaps = 0;\n  const n = array.length;\n\n  for (let i = 1; i < n; i++) {\n    const key = array[i]!;\n    let j = i - 1;\n\n    while (j >= 0) {\n      comparisons++;\n      if (array[j]! > key) {\n        array[j + 1] = array[j]!;\n        swaps++; // element shift\n        j--;\n      } else {\n        break;\n      }\n    }\n    array[j + 1] = key;\n  }\n\n  return {\n    sorted: array,\n    metrics: { comparisons, swaps },\n  };\n}\n',
    stepMappings: [{ action: "MAIN", startLine: 1, endLine: 53 }],
  },
];

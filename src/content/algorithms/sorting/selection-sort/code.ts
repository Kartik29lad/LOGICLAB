import type { CodeReference } from "../../../schema/content-types";

export const code: CodeReference[] = [
  {
    language: "typescript",
    entryPoint: "selection-sort",
    source:
      'import type { AlgorithmMetadata, SortResult } from "../../../contracts/algorithm.types";\n\nexport const SELECTION_SORT_METADATA: AlgorithmMetadata = {\n  id: "sorting-selection-sort",\n  slug: "selection-sort",\n  name: "Selection Sort",\n  category: "sorting",\n  description:\n    "Divides the list into sorted and unsorted regions, repeatedly selecting the smallest element from the unsorted region.",\n  complexity: {\n    time: {\n      best: "O(n^2)",\n      average: "O(n^2)",\n      worst: "O(n^2)",\n    },\n    space: "O(1)",\n    isStable: false,\n    isInPlace: true,\n  },\n};\n\n/**\n * Pure Selection Sort.\n */\nexport function selectionSort(input: readonly number[]): SortResult<number> {\n  const array = [...input];\n  let comparisons = 0;\n  let swaps = 0;\n  const n = array.length;\n\n  for (let i = 0; i < n - 1; i++) {\n    let minIndex = i;\n\n    for (let j = i + 1; j < n; j++) {\n      comparisons++;\n      if (array[j]! < array[minIndex]!) {\n        minIndex = j;\n      }\n    }\n\n    if (minIndex !== i) {\n      const temp = array[i]!;\n      array[i] = array[minIndex]!;\n      array[minIndex] = temp;\n      swaps++;\n    }\n  }\n\n  return {\n    sorted: array,\n    metrics: { comparisons, swaps },\n  };\n}\n',
    stepMappings: [{ action: "MAIN", startLine: 1, endLine: 54 }],
  },
];

import type { CodeReference } from "../../../schema/content-types";

export const code: CodeReference[] = [
  {
    language: "typescript",
    entryPoint: "bubble-sort",
    source:
      'import type { AlgorithmMetadata, SortResult } from "../../../contracts/algorithm.types";\n\nexport const BUBBLE_SORT_METADATA: AlgorithmMetadata = {\n  id: "sorting-bubble-sort",\n  slug: "bubble-sort",\n  name: "Bubble Sort",\n  category: "sorting",\n  description:\n    "Repeatedly steps through the list, compares adjacent elements, and swaps them if in the wrong order.",\n  complexity: {\n    time: {\n      best: "O(n)",\n      average: "O(n^2)",\n      worst: "O(n^2)",\n    },\n    space: "O(1)",\n    isStable: true,\n    isInPlace: true,\n  },\n};\n\n/**\n * Pure, framework-independent Bubble Sort with early-termination optimization.\n */\nexport function bubbleSort(input: readonly number[]): SortResult<number> {\n  const array = [...input];\n  let comparisons = 0;\n  let swaps = 0;\n  const n = array.length;\n\n  for (let i = 0; i < n - 1; i++) {\n    let swapped = false;\n\n    for (let j = 0; j < n - i - 1; j++) {\n      comparisons++;\n      if (array[j]! > array[j + 1]!) {\n        const temp = array[j]!;\n        array[j] = array[j + 1]!;\n        array[j + 1] = temp;\n        swaps++;\n        swapped = true;\n      }\n    }\n\n    if (!swapped) break;\n  }\n\n  return {\n    sorted: array,\n    metrics: { comparisons, swaps },\n  };\n}\n',
    stepMappings: [{ action: "MAIN", startLine: 1, endLine: 53 }],
  },
];

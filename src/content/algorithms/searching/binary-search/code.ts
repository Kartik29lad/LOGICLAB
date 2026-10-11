import type { CodeReference } from "../../../schema/content-types";

export const code: CodeReference[] = [
  {
    language: "typescript",
    entryPoint: "binary-search",
    source:
      'import type { AlgorithmMetadata, SearchResult } from "../../../contracts/algorithm.types";\n\nexport const BINARY_SEARCH_METADATA: AlgorithmMetadata = {\n  id: "searching-binary-search",\n  slug: "binary-search",\n  name: "Binary Search",\n  category: "searching",\n  description:\n    "Finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.",\n  complexity: {\n    time: {\n      best: "O(1)",\n      average: "O(log n)",\n      worst: "O(log n)",\n    },\n    space: "O(1)",\n  },\n};\n\n/**\n * Pure Binary Search on sorted numbers.\n */\nexport function binarySearch(sortedArray: readonly number[], target: number): SearchResult {\n  let low = 0;\n  let high = sortedArray.length - 1;\n  let comparisons = 0;\n  let steps = 0;\n\n  while (low <= high) {\n    steps++;\n    const mid = Math.floor((low + high) / 2);\n    const midVal = sortedArray[mid]!;\n\n    comparisons++;\n    if (midVal === target) {\n      return {\n        foundIndex: mid,\n        metrics: { comparisons, steps },\n      };\n    }\n\n    if (midVal < target) {\n      low = mid + 1;\n    } else {\n      high = mid - 1;\n    }\n  }\n\n  return {\n    foundIndex: -1,\n    metrics: { comparisons, steps },\n  };\n}\n',
    stepMappings: [{ action: "MAIN", startLine: 1, endLine: 54 }],
  },
];

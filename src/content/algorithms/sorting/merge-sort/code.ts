import type { CodeReference } from "../../../schema/content-types";

export const code: CodeReference[] = [
  {
    language: "typescript",
    entryPoint: "merge-sort",
    source:
      'import type { AlgorithmMetadata, SortResult } from "../../../contracts/algorithm.types";\n\nexport const MERGE_SORT_METADATA: AlgorithmMetadata = {\n  id: "sorting-merge-sort",\n  slug: "merge-sort",\n  name: "Merge Sort",\n  category: "sorting",\n  description:\n    "A divide-and-conquer algorithm that recursively splits the array into halves, sorts each half, and merges them.",\n  complexity: {\n    time: {\n      best: "O(n log n)",\n      average: "O(n log n)",\n      worst: "O(n log n)",\n    },\n    space: "O(n)",\n    isStable: true,\n    isInPlace: false,\n  },\n};\n\n/**\n * Pure Merge Sort.\n */\nexport function mergeSort(input: readonly number[]): SortResult<number> {\n  const array = [...input];\n  let comparisons = 0;\n  let writes = 0; // count auxiliary writes produced during merging\n\n  function divideAndConquer(arr: number[]): number[] {\n    if (arr.length <= 1) return arr;\n\n    const mid = Math.floor(arr.length / 2);\n    const left = divideAndConquer(arr.slice(0, mid));\n    const right = divideAndConquer(arr.slice(mid));\n\n    return merge(left, right);\n  }\n\n  function merge(left: number[], right: number[]): number[] {\n    const merged: number[] = [];\n    let i = 0;\n    let j = 0;\n\n    while (i < left.length && j < right.length) {\n      comparisons++;\n      if (left[i]! <= right[j]!) {\n        merged.push(left[i]!);\n        i++;\n      } else {\n        merged.push(right[j]!);\n        j++;\n      }\n      writes++;\n    }\n\n    while (i < left.length) {\n      merged.push(left[i]!);\n      writes++;\n      i++;\n    }\n\n    while (j < right.length) {\n      merged.push(right[j]!);\n      writes++;\n      j++;\n    }\n\n    return merged;\n  }\n\n  const sorted = divideAndConquer(array);\n\n  return {\n    sorted,\n    metrics: { comparisons, swaps: 0, writes },\n  };\n}\n',
    stepMappings: [{ action: "MAIN", startLine: 1, endLine: 79 }],
  },
];

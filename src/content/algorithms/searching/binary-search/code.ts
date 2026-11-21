import type { CodeReference } from "../../../schema/content-types";

export const code: CodeReference[] = [
  {
    language: "typescript",
    entryPoint: "binary-search",
    source: `import type { AlgorithmMetadata, SearchResult } from "../../../contracts/algorithm.types";

export const BINARY_SEARCH_METADATA: AlgorithmMetadata = {
  id: "searching-binary-search",
  slug: "binary-search",
  name: "Binary Search",
  category: "searching",
  description:
    "Finds the position of a target value within an ascending or descending sorted array by repeatedly dividing the search interval in half.",
  complexity: {
    time: {
      best: "O(1)",
      average: "O(log n)",
      worst: "O(log n)",
    },
    space: "O(1)",
  },
};

/**
 * Binary Search on ascending or descending sorted numbers.
 */
export function binarySearch(sortedArray: readonly number[], target: number): SearchResult {
  let low = 0;
  let high = sortedArray.length - 1;
  const ascending = sortedArray.length < 2 || sortedArray[0]! <= sortedArray[sortedArray.length - 1]!;
  let comparisons = 0;
  let steps = 0;

  while (low <= high) {
    steps++;
    const mid = Math.floor((low + high) / 2);
    const midVal = sortedArray[mid]!;

    comparisons++;
    if (midVal === target) {
      return {
        foundIndex: mid,
        metrics: { comparisons, steps },
      };
    }

    const targetIsAfterMid = ascending ? midVal < target : midVal > target;
    if (targetIsAfterMid) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return {
    foundIndex: -1,
    metrics: { comparisons, steps },
  };
}
`,
    stepMappings: [{ action: "MAIN", startLine: 1, endLine: 55 }],
  },
];

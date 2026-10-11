import type { AlgorithmStepObserver } from "../../../contracts/algorithm-observer";
import type { AlgorithmMetadata, SearchResult } from "../../../contracts/algorithm.types";

export const BINARY_SEARCH_METADATA: AlgorithmMetadata = {
  id: "searching-binary-search",
  slug: "binary-search",
  name: "Binary Search",
  category: "searching",
  description:
    "Finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.",
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
 * Pure Binary Search on sorted numbers.
 */
export function binarySearch(
  sortedArray: readonly number[],
  target: number,
  observer?: AlgorithmStepObserver
): SearchResult {
  let low = 0;
  let high = sortedArray.length - 1;
  let comparisons = 0;
  let steps = 0;

  while (low <= high) {
    steps++;
    const mid = Math.floor((low + high) / 2);
    const midVal = sortedArray[mid]!;

    comparisons++;
    observer?.emit("COMPARE", { low, high, mid, target }, [...sortedArray]);
    if (midVal === target) {
      observer?.emit("FOUND", { index: mid, target }, [...sortedArray]);
      return {
        foundIndex: mid,
        metrics: { comparisons, steps },
      };
    }

    if (midVal < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  observer?.emit("NOT_FOUND", { target }, [...sortedArray]);
  return {
    foundIndex: -1,
    metrics: { comparisons, steps },
  };
}

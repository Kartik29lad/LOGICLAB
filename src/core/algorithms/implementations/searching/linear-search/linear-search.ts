import type { AlgorithmStepObserver } from "../../../contracts/algorithm-observer";
import type { AlgorithmMetadata, SearchResult } from "../../../contracts/algorithm.types";

export const LINEAR_SEARCH_METADATA: AlgorithmMetadata = {
  id: "searching-linear-search",
  slug: "linear-search",
  name: "Linear Search",
  category: "searching",
  description:
    "Sequentially checks each element of the list until a match is found or the whole list has been searched.",
  complexity: {
    time: {
      best: "O(1)",
      average: "O(n)",
      worst: "O(n)",
    },
    space: "O(1)",
  },
};

/**
 * Pure Linear Search.
 */
export function linearSearch(
  array: readonly number[],
  target: number,
  observer?: AlgorithmStepObserver
): SearchResult {
  let comparisons = 0;

  for (let i = 0; i < array.length; i++) {
    comparisons++;
    observer?.emit("COMPARE", { index: i, target }, [...array]);
    if (array[i] === target) {
      observer?.emit("FOUND", { index: i, target }, [...array]);
      return {
        foundIndex: i,
        metrics: { comparisons, steps: i + 1 },
      };
    }
  }

  observer?.emit("NOT_FOUND", { target }, [...array]);
  return {
    foundIndex: -1,
    metrics: { comparisons, steps: array.length },
  };
}

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
export function linearSearch(array: readonly number[], target: number): SearchResult {
  let comparisons = 0;

  for (let i = 0; i < array.length; i++) {
    comparisons++;
    if (array[i] === target) {
      return {
        foundIndex: i,
        metrics: { comparisons, steps: i + 1 },
      };
    }
  }

  return {
    foundIndex: -1,
    metrics: { comparisons, steps: array.length },
  };
}

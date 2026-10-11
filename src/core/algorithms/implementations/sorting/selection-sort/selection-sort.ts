import type { AlgorithmStepObserver } from "../../../contracts/algorithm-observer";
import type { AlgorithmMetadata, SortResult } from "../../../contracts/algorithm.types";

export const SELECTION_SORT_METADATA: AlgorithmMetadata = {
  id: "sorting-selection-sort",
  slug: "selection-sort",
  name: "Selection Sort",
  category: "sorting",
  description:
    "Divides the list into sorted and unsorted regions, repeatedly selecting the smallest element from the unsorted region.",
  complexity: {
    time: {
      best: "O(n^2)",
      average: "O(n^2)",
      worst: "O(n^2)",
    },
    space: "O(1)",
    isStable: false,
    isInPlace: true,
  },
};

/**
 * Pure Selection Sort.
 */
export function selectionSort(
  input: readonly number[],
  observer?: AlgorithmStepObserver
): SortResult<number> {
  const array = [...input];
  let comparisons = 0;
  let swaps = 0;
  const n = array.length;

  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    observer?.emit("SELECT", { index: i }, [...array]);

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      observer?.emit("COMPARE", { indexes: [j, minIndex] }, [...array]);
      if (array[j]! < array[minIndex]!) {
        minIndex = j;
      }
    }

    if (minIndex !== i) {
      const temp = array[i]!;
      array[i] = array[minIndex]!;
      array[minIndex] = temp;
      swaps++;
      observer?.emit("SWAP", { indexes: [i, minIndex] }, [...array]);
    }
  }

  return {
    sorted: array,
    metrics: { comparisons, swaps },
  };
}

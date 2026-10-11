import type { AlgorithmStepObserver } from "../../../contracts/algorithm-observer";
import type { AlgorithmMetadata, SortResult } from "../../../contracts/algorithm.types";

export const INSERTION_SORT_METADATA: AlgorithmMetadata = {
  id: "sorting-insertion-sort",
  slug: "insertion-sort",
  name: "Insertion Sort",
  category: "sorting",
  description:
    "Builds the final sorted array one item at a time, shifting larger elements to the right to insert each item.",
  complexity: {
    time: {
      best: "O(n)",
      average: "O(n^2)",
      worst: "O(n^2)",
    },
    space: "O(1)",
    isStable: true,
    isInPlace: true,
  },
};

/**
 * Pure Insertion Sort.
 */
export function insertionSort(
  input: readonly number[],
  observer?: AlgorithmStepObserver
): SortResult<number> {
  const array = [...input];
  let comparisons = 0;
  let swaps = 0;
  const n = array.length;

  for (let i = 1; i < n; i++) {
    const key = array[i]!;
    observer?.emit("SET_CURRENT", { index: i }, [...array]);
    let j = i - 1;

    while (j >= 0) {
      comparisons++;
      observer?.emit("COMPARE", { indexes: [j, i] }, [...array]);
      if (array[j]! > key) {
        array[j + 1] = array[j]!;
        swaps++; // element shift
        observer?.emit("WRITE", { index: j + 1 }, [...array]);
        j--;
      } else {
        break;
      }
    }
    array[j + 1] = key;
  }

  return {
    sorted: array,
    metrics: { comparisons, swaps },
  };
}

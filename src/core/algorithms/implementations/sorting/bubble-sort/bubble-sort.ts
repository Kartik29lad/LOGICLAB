import type { AlgorithmMetadata, SortResult } from "../../../contracts/algorithm.types";

export const BUBBLE_SORT_METADATA: AlgorithmMetadata = {
  id: "sorting-bubble-sort",
  slug: "bubble-sort",
  name: "Bubble Sort",
  category: "sorting",
  description:
    "Repeatedly steps through the list, compares adjacent elements, and swaps them if in the wrong order.",
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
 * Pure, framework-independent Bubble Sort with early-termination optimization.
 */
export function bubbleSort(input: readonly number[]): SortResult<number> {
  const array = [...input];
  let comparisons = 0;
  let swaps = 0;
  const n = array.length;

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      if (array[j]! > array[j + 1]!) {
        const temp = array[j]!;
        array[j] = array[j + 1]!;
        array[j + 1] = temp;
        swaps++;
        swapped = true;
      }
    }

    if (!swapped) break;
  }

  return {
    sorted: array,
    metrics: { comparisons, swaps },
  };
}

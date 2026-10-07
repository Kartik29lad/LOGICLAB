import type { AlgorithmMetadata, SortResult } from "../../../contracts/algorithm.types";

export const QUICK_SORT_METADATA: AlgorithmMetadata = {
  id: "sorting-quick-sort",
  slug: "quick-sort",
  name: "Quick Sort",
  category: "sorting",
  description:
    "Selects a pivot element and partitions the array into values smaller and larger than the pivot, recursively sorting each side.",
  complexity: {
    time: {
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n^2)",
    },
    space: "O(log n)",
    isStable: false,
    isInPlace: true,
  },
};

/**
 * Pure Quick Sort using Lomuto partition scheme.
 */
export function quickSort(input: readonly number[]): SortResult<number> {
  const array = [...input];
  let comparisons = 0;
  let swaps = 0;

  function sort(low: number, high: number): void {
    if (low < high) {
      const pi = partition(low, high);
      sort(low, pi - 1);
      sort(pi + 1, high);
    }
  }

  function partition(low: number, high: number): number {
    const pivot = array[high]!;
    let i = low - 1;

    for (let j = low; j < high; j++) {
      comparisons++;
      if (array[j]! <= pivot) {
        i++;
        const temp = array[i]!;
        array[i] = array[j]!;
        array[j] = temp;
        swaps++;
      }
    }

    const temp = array[i + 1]!;
    array[i + 1] = array[high]!;
    array[high] = temp;
    swaps++;

    return i + 1;
  }

  if (array.length > 1) {
    sort(0, array.length - 1);
  }

  return {
    sorted: array,
    metrics: { comparisons, swaps },
  };
}

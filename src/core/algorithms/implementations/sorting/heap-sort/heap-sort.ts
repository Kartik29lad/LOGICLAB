import type { AlgorithmMetadata, SortResult } from "../../../contracts/algorithm.types";

export const HEAP_SORT_METADATA: AlgorithmMetadata = {
  id: "sorting-heap-sort",
  slug: "heap-sort",
  name: "Heap Sort",
  category: "sorting",
  description:
    "Converts the array into a max-heap, repeatedly extracts the maximum element to the sorted partition, and restores the heap property.",
  complexity: {
    time: {
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n log n)",
    },
    space: "O(1)",
    isStable: false,
    isInPlace: true,
  },
};

/**
 * Pure Heap Sort.
 */
export function heapSort(input: readonly number[]): SortResult<number> {
  const array = [...input];
  let comparisons = 0;
  let swaps = 0;
  const n = array.length;

  function heapify(size: number, rootIdx: number): void {
    let largest = rootIdx;
    const left = 2 * rootIdx + 1;
    const right = 2 * rootIdx + 2;

    if (left < size) {
      comparisons++;
      if (array[left]! > array[largest]!) {
        largest = left;
      }
    }

    if (right < size) {
      comparisons++;
      if (array[right]! > array[largest]!) {
        largest = right;
      }
    }

    if (largest !== rootIdx) {
      const temp = array[rootIdx]!;
      array[rootIdx] = array[largest]!;
      array[largest] = temp;
      swaps++;

      heapify(size, largest);
    }
  }

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }

  // Extract elements one by one from heap
  for (let i = n - 1; i > 0; i--) {
    const temp = array[0]!;
    array[0] = array[i]!;
    array[i] = temp;
    swaps++;

    heapify(i, 0);
  }

  return {
    sorted: array,
    metrics: { comparisons, swaps },
  };
}

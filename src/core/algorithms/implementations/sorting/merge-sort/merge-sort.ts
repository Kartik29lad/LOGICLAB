import type { AlgorithmStepObserver } from "../../../contracts/algorithm-observer";
import type { AlgorithmMetadata, SortResult } from "../../../contracts/algorithm.types";

export const MERGE_SORT_METADATA: AlgorithmMetadata = {
  id: "sorting-merge-sort",
  slug: "merge-sort",
  name: "Merge Sort",
  category: "sorting",
  description:
    "A divide-and-conquer algorithm that recursively splits the array into halves, sorts each half, and merges them.",
  complexity: {
    time: {
      best: "O(n log n)",
      average: "O(n log n)",
      worst: "O(n log n)",
    },
    space: "O(n)",
    isStable: true,
    isInPlace: false,
  },
};

/**
 * Pure Merge Sort.
 */
export function mergeSort(
  input: readonly number[],
  observer?: AlgorithmStepObserver
): SortResult<number> {
  const array = [...input];
  let comparisons = 0;
  let writes = 0; // count auxiliary writes produced during merging

  function divideAndConquer(arr: number[]): number[] {
    if (arr.length <= 1) return arr;

    const mid = Math.floor(arr.length / 2);
    observer?.emit("PARTITION", { length: arr.length, mid }, [...array]);
    const left = divideAndConquer(arr.slice(0, mid));
    const right = divideAndConquer(arr.slice(mid));

    return merge(left, right);
  }

  function merge(left: number[], right: number[]): number[] {
    const merged: number[] = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
      comparisons++;
      observer?.emit("COMPARE", { left: left[i], right: right[j] }, [...array]);
      if (left[i]! <= right[j]!) {
        merged.push(left[i]!);
        i++;
      } else {
        merged.push(right[j]!);
        j++;
      }
      writes++;
      observer?.emit("WRITE", { value: merged.at(-1) }, [...array]);
    }

    while (i < left.length) {
      merged.push(left[i]!);
      writes++;
      i++;
    }

    while (j < right.length) {
      merged.push(right[j]!);
      writes++;
      j++;
    }

    return merged;
  }

  const sorted = divideAndConquer(array);

  return {
    sorted,
    metrics: { comparisons, swaps: 0, writes },
  };
}

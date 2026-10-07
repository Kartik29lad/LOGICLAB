import { describe, expect, it } from "vitest";

import {
  BUBBLE_SORT_METADATA,
  bubbleSort,
  HEAP_SORT_METADATA,
  heapSort,
  INSERTION_SORT_METADATA,
  insertionSort,
  MERGE_SORT_METADATA,
  mergeSort,
  QUICK_SORT_METADATA,
  quickSort,
  SELECTION_SORT_METADATA,
  selectionSort,
} from "../../../src/core/algorithms/implementations/sorting";
import { ArrayGenerator } from "../../../src/core/input/generators/array-generator";

describe("Phase 5: Sorting Algorithm Core Engine", () => {
  const algorithms = [
    { name: "Bubble Sort", fn: bubbleSort, metadata: BUBBLE_SORT_METADATA },
    { name: "Selection Sort", fn: selectionSort, metadata: SELECTION_SORT_METADATA },
    { name: "Insertion Sort", fn: insertionSort, metadata: INSERTION_SORT_METADATA },
    { name: "Merge Sort", fn: mergeSort, metadata: MERGE_SORT_METADATA },
    { name: "Quick Sort", fn: quickSort, metadata: QUICK_SORT_METADATA },
    { name: "Heap Sort", fn: heapSort, metadata: HEAP_SORT_METADATA },
  ];

  for (const { name, fn, metadata } of algorithms) {
    describe(`${name}`, () => {
      it("has complete and valid theoretical complexity metadata", () => {
        expect(metadata.complexity.time.best).toBeDefined();
        expect(metadata.complexity.time.average).toBeDefined();
        expect(metadata.complexity.time.worst).toBeDefined();
        expect(metadata.complexity.space).toBeDefined();
      });

      it("correctly sorts random datasets", () => {
        const input = ArrayGenerator.random(25, 1, 100, 42);
        const expected = [...input].sort((a, b) => a - b);
        const result = fn(input);

        expect(result.sorted).toEqual(expected);
        expect(result.metrics.comparisons).toBeGreaterThan(0);
      });

      it("handles already sorted arrays", () => {
        const input = [1, 2, 3, 4, 5, 6];
        const result = fn(input);
        expect(result.sorted).toEqual(input);
      });

      it("handles reversed arrays", () => {
        const input = [10, 8, 6, 4, 2, 0];
        const expected = [0, 2, 4, 6, 8, 10];
        const result = fn(input);
        expect(result.sorted).toEqual(expected);
      });

      it("handles arrays with duplicate values", () => {
        const input = [5, 2, 8, 2, 5, 1, 8, 2];
        const expected = [1, 2, 2, 2, 5, 5, 8, 8];
        const result = fn(input);
        expect(result.sorted).toEqual(expected);
      });

      it("handles single-item and empty arrays gracefully", () => {
        expect(fn([]).sorted).toEqual([]);
        expect(fn([42]).sorted).toEqual([42]);
      });
    });
  }
});

import { describe, expect, it } from "vitest";

import {
  BINARY_SEARCH_METADATA,
  binarySearch,
  LINEAR_SEARCH_METADATA,
  linearSearch,
} from "../../../src/core/algorithms/implementations/searching";

describe("Phase 5: Searching Algorithm Core Engine", () => {
  describe("Linear Search", () => {
    it("has complete complexity metadata", () => {
      expect(LINEAR_SEARCH_METADATA.complexity.time.best).toBe("O(1)");
      expect(LINEAR_SEARCH_METADATA.complexity.time.worst).toBe("O(n)");
    });

    it("finds elements in unsorted arrays", () => {
      const arr = [42, 12, 88, 3, 99, 15];
      const result = linearSearch(arr, 3);
      expect(result.foundIndex).toBe(3);
      expect(result.metrics.comparisons).toBe(4);
    });

    it("returns -1 for elements that do not exist", () => {
      const arr = [10, 20, 30];
      const result = linearSearch(arr, 999);
      expect(result.foundIndex).toBe(-1);
      expect(result.metrics.comparisons).toBe(3);
    });

    it("handles empty arrays", () => {
      expect(linearSearch([], 10).foundIndex).toBe(-1);
    });
  });

  describe("Binary Search", () => {
    it("has complete complexity metadata", () => {
      expect(BINARY_SEARCH_METADATA.complexity.time.best).toBe("O(1)");
      expect(BINARY_SEARCH_METADATA.complexity.time.worst).toBe("O(log n)");
    });

    it("finds elements in sorted arrays", () => {
      const sorted = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
      expect(binarySearch(sorted, 12).foundIndex).toBe(3);
      expect(binarySearch(sorted, 2).foundIndex).toBe(0);
      expect(binarySearch(sorted, 91).foundIndex).toBe(9);
    });

    it("returns -1 for elements not found in sorted array", () => {
      const sorted = [10, 20, 30, 40, 50];
      expect(binarySearch(sorted, 5).foundIndex).toBe(-1);
      expect(binarySearch(sorted, 35).foundIndex).toBe(-1);
      expect(binarySearch(sorted, 99).foundIndex).toBe(-1);
    });

    it("handles single-item and empty arrays", () => {
      expect(binarySearch([], 5).foundIndex).toBe(-1);
      expect(binarySearch([5], 5).foundIndex).toBe(0);
      expect(binarySearch([5], 9).foundIndex).toBe(-1);
    });
  });
});

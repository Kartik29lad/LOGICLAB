import { describe, expect, it } from "vitest";

import {
  isSortedAscending,
  MAX_INTERACTIVE_ARRAY_LENGTH,
  parseArrayInput,
  validateArrayExperiment,
} from "@/features/visualizer/array-input";

describe("array interactive input", () => {
  it("parses comma, space, and newline separated values", () => {
    expect(parseArrayInput("7, 3\n9 2").values).toEqual([7, 3, 9, 2]);
  });

  it("accepts empty arrays", () => {
    expect(parseArrayInput("   ").values).toEqual([]);
  });

  it("rejects non-finite values", () => {
    expect(parseArrayInput("7, nope").error).toContain("Value 2");
  });

  it("enforces the interactive array limit", () => {
    const input = Array.from({ length: MAX_INTERACTIVE_ARRAY_LENGTH + 1 }, (_, index) =>
      String(index)
    ).join(",");
    expect(parseArrayInput(input).error).toContain("at most");
  });

  it("requires a sorted array for binary search", () => {
    expect(validateArrayExperiment("binary-search", [3, 1, 2], 2)).toContain("sorted");
    expect(validateArrayExperiment("binary-search", [1, 2, 3], 2)).toBeNull();
  });

  it("requires a target for search algorithms", () => {
    expect(validateArrayExperiment("linear-search", [1, 2, 3], undefined)).toContain("target");
  });

  it("checks ascending order", () => {
    expect(isSortedAscending([1, 2, 2, 3])).toBe(true);
    expect(isSortedAscending([1, 3, 2])).toBe(false);
  });
});

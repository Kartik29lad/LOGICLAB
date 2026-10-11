import { describe, expect, it } from "vitest";

import { createComplexityEducation } from "@/features/visualizer/complexity-education";

const content = {
  metadata: {
    title: "Bubble Sort",
    complexity: {
      timeBest: "O(n)",
      timeAverage: "O(n²)",
      timeWorst: "O(n²)",
      space: "O(1)",
      stable: true,
      inPlace: true,
    },
    mainIdea: "repeatedly swap adjacent out-of-order values",
  },
} as never;

describe("complexity education", () => {
  it("preserves trusted complexity metadata and adds educational context", () => {
    const result = createComplexityEducation(content);
    expect(result?.time.average).toBe("O(n²)");
    expect(result?.facts).toContain("Stable: equal values preserve their relative order.");
    expect(result?.facts).toContain(
      "In-place: the algorithm uses the input structure without requiring a separate result structure."
    );
  });
  it("returns null when complexity metadata is absent", () => {
    expect(createComplexityEducation({ metadata: { title: "X" } } as never)).toBeNull();
  });
});

import { describe, expect, it } from "vitest";

import { executeAlgorithm } from "../../../../src/server/execution/execution-service";

describe("bounded API execution", () => {
  it("executes sorting and returns trace events", () => {
    const result = executeAlgorithm({ algorithmSlug: "bubble-sort", input: [3, 1, 2] });
    expect(result.output).toEqual({
      sorted: [1, 2, 3],
      metrics: { comparisons: expect.any(Number), swaps: expect.any(Number) },
    });
    expect(result.events.length).toBeGreaterThan(0);
  });
  it("enforces the trace step limit", () => {
    expect(() =>
      executeAlgorithm({ algorithmSlug: "bubble-sort", input: [5, 4, 3, 2, 1], maxSteps: 1 })
    ).toThrow();
  });
});

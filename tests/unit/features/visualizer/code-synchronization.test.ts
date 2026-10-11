import { describe, expect, it } from "vitest";

import type { ExecutionTraceStep } from "@/contracts/events/trace-events";
import type { ContentPackage } from "@/content/schema/content-types";
import { resolveExecutionReferences } from "@/features/visualizer/code-synchronization";

const content = {
  metadata: { complexity: undefined },
  code: [
    {
      language: "typescript",
      entryPoint: "demo",
      source: "one\ntwo\nthree",
      stepMappings: [{ action: "COMPARE", startLine: 2, endLine: 2 }],
    },
  ],
  pseudocode: "compare\nswap",
} as unknown as ContentPackage;

const step = (event: ExecutionTraceStep["event"]): ExecutionTraceStep => ({
  stepIndex: 0,
  event,
  stateBefore: [],
  stateAfter: [],
  metrics: {
    comparisons: 1,
    swaps: 0,
    reads: 0,
    writes: 0,
    visits: 0,
    iterations: 1,
    elapsedMs: 0,
  },
});

describe("code synchronization", () => {
  it("prefers canonical trace line references", () => {
    const result = resolveExecutionReferences(
      content,
      step({ stepIndex: 0, type: "COMPARE", codeReference: { lineNumbers: [3] } })
    );
    expect(result.code?.activeLines).toEqual([3]);
    expect(result.code?.synchronized).toBe(true);
  });

  it("falls back to content event mappings", () => {
    const result = resolveExecutionReferences(content, step({ stepIndex: 0, type: "COMPARE" }));
    expect(result.code?.activeLines).toEqual([2]);
    expect(result.code?.synchronized).toBe(true);
  });

  it("keeps unmapped references explicit instead of guessing", () => {
    const result = resolveExecutionReferences(content, step({ stepIndex: 0, type: "SWAP" }));
    expect(result.code?.activeLines).toEqual([]);
    expect(result.code?.synchronized).toBe(false);
  });
});

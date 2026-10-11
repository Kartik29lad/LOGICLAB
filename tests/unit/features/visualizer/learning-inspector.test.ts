import { describe, expect, it } from "vitest";

import type { CanonicalExecutionTrace, ExecutionTraceStep } from "@/contracts/events/trace-events";
import type { ContentPackage } from "@/content/schema/content-types";
import { inspectStep } from "@/features/visualizer/learning-inspector";

const content: ContentPackage = {
  metadata: {
    id: "test",
    type: "ALGORITHM",
    slug: "test",
    title: "Test",
    summary: "Test",
    description: "Test",
    category: "sorting",
    difficulty: "BEGINNER",
    learningObjectives: [],
    prerequisites: [],
    examples: [],
    commonMistakes: [],
    relatedContent: [],
    tags: [],
    mainIdea: "The algorithm makes a decision from the current state.",
    isActive: true,
    schemaVersion: 1,
    complexity: { timeBest: "O(n)", timeAverage: "O(n²)", timeWorst: "O(n²)", space: "O(1)" },
  },
  explanation: "Test explanation",
  pseudocode: "compare(a, b)",
  code: [
    {
      language: "typescript",
      source: "const x = 1;",
      stepMappings: [{ action: "COMPARE", startLine: 1, endLine: 1 }],
    },
  ],
};

function step(
  type: ExecutionTraceStep["event"]["type"],
  index: number,
  before: unknown,
  after: unknown
): ExecutionTraceStep {
  return {
    stepIndex: index,
    event: {
      stepIndex: index,
      type,
      payload: { i: 0, j: 1 },
      references: [{ entityType: "array-index", id: 0 }],
      codeReference: { lineNumbers: [2] },
    },
    stateBefore: before,
    stateAfter: after,
    metrics: {
      comparisons: index + 1,
      swaps: 0,
      reads: 1,
      writes: 0,
      visits: 0,
      iterations: 1,
      elapsedMs: 1,
    },
  };
}

const first = step("COMPARE", 0, [7, 3], [7, 3]);
const second = step("SWAP", 1, [7, 3], [3, 7]);
const trace: CanonicalExecutionTrace = {
  executionId: "x",
  algorithmSlug: "test",
  input: [7, 3],
  output: [3, 7],
  initialState: [7, 3],
  steps: [first, second],
  finalState: [3, 7],
  metrics: second.metrics,
  status: "completed",
};

describe("learning inspector V2", () => {
  it("produces concise operation content and expanded technical context", () => {
    const inspection = inspectStep(content, trace, first, second);
    expect(inspection.operationLabel).toBe("Compare");
    expect(inspection.explanation.short).toContain("Compare");
    expect(inspection.entities[0]?.label).toContain("array index 0");
    expect(inspection.technicalState).toEqual({ i: 0, j: 1 });
    expect(inspection.nextEvent).toBe("SWAP");
  });

  it("prefers canonical trace code references for synchronization", () => {
    const inspection = inspectStep(content, trace, first, second);
    expect(inspection.code?.lines).toEqual([2]);
    expect(inspection.code?.synchronized).toBe(true);
  });

  it("describes state changes without replacing the canonical states", () => {
    const inspection = inspectStep(content, trace, second);
    expect(inspection.stateChange.changed).toBe(true);
    expect(inspection.stateChange.before).toContain("7");
    expect(inspection.stateChange.after).toContain("3");
  });
});

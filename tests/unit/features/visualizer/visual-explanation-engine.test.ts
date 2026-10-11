import { describe, expect, it } from "vitest";

import type { ExecutionTraceStep } from "@/contracts/events/trace-events";
import type { ContentPackage } from "@/content/schema/content-types";
import { explainVisualStep } from "@/features/visualizer/visual-explanation-engine";

const content: ContentPackage = {
  metadata: {
    id: "bubble",
    type: "ALGORITHM",
    slug: "bubble-sort",
    title: "Bubble Sort",
    summary: "",
    description: "",
    category: "sorting",
    difficulty: "BEGINNER",
    learningObjectives: [],
    prerequisites: [],
    examples: [],
    commonMistakes: [],
    relatedContent: [],
    tags: [],
    mainIdea: "Repeated local swaps move larger values toward the end of the unsorted region.",
    whyItWorks:
      "After each pass, the largest remaining value is placed at the end of the active region.",
    formulas: ["Compare a[j] with a[j + 1].", "Swap when a[j] > a[j + 1]."],
    stepExplanations: [{ event: "COMPARE", explanation: "Compare neighboring values." }],
    isActive: true,
    schemaVersion: 1,
  },
  explanation: "Bubble Sort repeatedly compares neighbors.",
};

function makeStep(
  type: ExecutionTraceStep["event"]["type"],
  index: number,
  before: unknown,
  after: unknown,
  payload: Record<string, unknown>
): ExecutionTraceStep {
  return {
    stepIndex: index,
    event: { stepIndex: index, type, payload },
    stateBefore: before,
    stateAfter: after,
    metrics: {
      comparisons: index + 1,
      swaps: type === "SWAP" ? 1 : 0,
      reads: 0,
      writes: 0,
      visits: 0,
      iterations: 1,
      elapsedMs: 1,
    },
  };
}

describe("visual explanation engine", () => {
  it("explains a comparison from trace state and content rule", () => {
    const step = makeStep("COMPARE", 0, [7, 3], [7, 3], { i: 0, j: 1 });
    const explanation = explainVisualStep(content, step);
    expect(explanation.rule).toContain("Compare");
    expect(explanation.decision).toContain("7 is greater than 3");
    expect(explanation.source).toBe("combined");
  });

  it("uses explicit trace reasoning when available", () => {
    const step = makeStep("SWAP", 0, [7, 3], [3, 7], {
      reason: "7 > 3, so the pair is out of order.",
    });
    const explanation = explainVisualStep(content, step);
    expect(explanation.decision).toContain("out of order");
  });

  it("does not invent a rule when neither content nor trace provides one", () => {
    const minimal = {
      ...content,
      metadata: { ...content.metadata, formulas: undefined, mainIdea: undefined },
    };
    const step = makeStep("READ", 0, [1], [1], { index: 0 });
    const explanation = explainVisualStep(minimal, step);
    expect(explanation.source).toBe("insufficient-data");
    expect(explanation.rule).toContain("No explicit rule");
  });
});

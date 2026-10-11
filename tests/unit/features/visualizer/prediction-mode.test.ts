import { describe, expect, it } from "vitest";

import {
  createPredictionChallenge,
  evaluatePrediction,
} from "@/features/visualizer/prediction-mode";

const trace = {
  executionId: "test",
  algorithmSlug: "bubble-sort",
  input: [2, 1],
  output: [1, 2],
  initialState: [2, 1],
  finalState: [1, 2],
  metrics: {
    comparisons: 1,
    swaps: 1,
    reads: 0,
    writes: 0,
    visits: 0,
    iterations: 1,
    elapsedMs: 0,
  },
  status: "completed" as const,
  steps: [
    {
      stepIndex: 0,
      event: { stepIndex: 0, type: "COMPARE" as const, description: "Compare 2 and 1." },
      stateBefore: [2, 1],
      stateAfter: [2, 1],
      metrics: {
        comparisons: 1,
        swaps: 0,
        reads: 0,
        writes: 0,
        visits: 0,
        iterations: 0,
        elapsedMs: 0,
      },
    },
    {
      stepIndex: 1,
      event: { stepIndex: 1, type: "SWAP" as const, description: "Swap the compared values." },
      stateBefore: [2, 1],
      stateAfter: [1, 2],
      metrics: {
        comparisons: 1,
        swaps: 1,
        reads: 0,
        writes: 0,
        visits: 0,
        iterations: 1,
        elapsedMs: 0,
      },
    },
  ],
};

describe("prediction mode", () => {
  it("uses the next canonical trace event", () => {
    const challenge = createPredictionChallenge(trace, 0);
    expect(challenge?.actual.type).toBe("SWAP");
    expect(challenge?.options.length).toBeGreaterThan(1);
  });

  it("evaluates correct and incorrect predictions", () => {
    const challenge = createPredictionChallenge(trace, 0)!;
    const correct = evaluatePrediction(challenge, challenge.actual.id);
    expect(correct.correct).toBe(true);
    const wrong = challenge.options.find((option) => option.type !== challenge.actual.type)!;
    expect(evaluatePrediction(challenge, wrong.id).correct).toBe(false);
  });

  it("returns no challenge after the final step", () => {
    expect(createPredictionChallenge(trace, 1)).toBeNull();
  });
});

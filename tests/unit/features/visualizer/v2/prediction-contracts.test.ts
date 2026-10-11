import { describe, expect, it } from "vitest";

import {
  createPredictionChallenge,
  evaluatePrediction,
} from "@/features/visualizer/prediction-mode";

import { makeArrayTrace } from "../../../../helpers/visualizer-fixtures";

describe("V2 prediction contracts", () => {
  it("uses the immediate next canonical event as the answer", () => {
    const trace = makeArrayTrace();
    const challenge = createPredictionChallenge(trace, 0);
    expect(challenge?.actual.type).toBe("SWAP");
    expect(challenge?.actual.id).toBe(challenge?.options[0]?.id);
  });

  it("produces deterministic option identifiers", () => {
    const trace = makeArrayTrace();
    const first = createPredictionChallenge(trace, 0);
    const second = createPredictionChallenge(trace, 0);
    expect(first?.options).toEqual(second?.options);
  });

  it("does not create a challenge for the final step", () => {
    const trace = makeArrayTrace();
    expect(createPredictionChallenge(trace, trace.steps.length - 1)).toBeNull();
  });

  it("evaluates an invalid option as incorrect without changing the canonical answer", () => {
    const trace = makeArrayTrace();
    const challenge = createPredictionChallenge(trace, 0)!;
    const result = evaluatePrediction(challenge, "missing-option");
    expect(result.correct).toBe(false);
    expect(result.actual.type).toBe("SWAP");
  });
});

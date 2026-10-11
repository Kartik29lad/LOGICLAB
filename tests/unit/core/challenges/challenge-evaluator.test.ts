import { describe, expect, it } from "vitest";

import { getChallengeDefinition } from "../../../../src/content/challenges";
import { evaluateChallenge } from "../../../../src/core/challenges";

describe("challenge evaluator", () => {
  it("awards full score for an accepted answer", () => {
    const definition = getChallengeDefinition("challenge-bubble-next-swap");
    if (!definition) throw new Error("fixture missing");
    const result = evaluateChallenge(definition, {
      challengeId: definition.id,
      answer: "swap",
      hintsUsed: 0,
    });
    expect(result.correct).toBe(true);
    expect(result.score).toBe(100);
  });

  it("applies a bounded hint penalty", () => {
    const definition = getChallengeDefinition("challenge-binary-half");
    if (!definition) throw new Error("fixture missing");
    const result = evaluateChallenge(definition, {
      challengeId: definition.id,
      answer: "half",
      hintsUsed: 1,
    });
    expect(result.correct).toBe(true);
    expect(result.score).toBe(80);
  });

  it("rejects invalid hint counts", () => {
    const definition = getChallengeDefinition("challenge-dfs-depth");
    if (!definition) throw new Error("fixture missing");
    expect(() =>
      evaluateChallenge(definition, { challengeId: definition.id, answer: "deep", hintsUsed: 2 })
    ).toThrow();
  });
});

import { describe, expect, it } from "vitest";

import { CHALLENGE_DEFINITIONS } from "../../../../src/content/challenges";

describe("challenge catalog", () => {
  it("contains one focused challenge for every initial algorithm", () => {
    expect(CHALLENGE_DEFINITIONS).toHaveLength(12);
    expect(new Set(CHALLENGE_DEFINITIONS.map((challenge) => challenge.algorithmSlug)).size).toBe(
      12
    );
  });

  it("keeps answer and scoring data server-side in the definition", () => {
    for (const challenge of CHALLENGE_DEFINITIONS) {
      expect(challenge.correctAnswer.length).toBeGreaterThan(0);
      expect(challenge.score).toBeGreaterThan(0);
      expect(challenge.hints.length).toBeGreaterThan(0);
    }
  });
});

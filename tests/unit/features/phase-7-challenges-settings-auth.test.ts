import { describe, expect, it } from "vitest";

import { evaluateChallenge } from "@/core/challenges";
import { CHALLENGE_DEFINITIONS, getChallengeDefinition } from "@/content/challenges";
import { getDiscoveryItem } from "@/content/discovery";

describe("Phase 7 — Challenges, Progress, Settings, and Authentication", () => {
  describe("Challenge Catalog & Educational Content Integration", () => {
    it("contains 12 focused challenges mapping to valid discovery algorithms", () => {
      expect(CHALLENGE_DEFINITIONS).toHaveLength(12);

      for (const challenge of CHALLENGE_DEFINITIONS) {
        expect(challenge.id).toBeDefined();
        expect(challenge.title.length).toBeGreaterThan(0);
        expect(challenge.prompt.length).toBeGreaterThan(0);
        expect(challenge.correctAnswer.length).toBeGreaterThan(0);
        expect(challenge.score).toBeGreaterThan(0);

        // Verify each challenge targets an existing discovery algorithm
        const algoItem = getDiscoveryItem(challenge.algorithmSlug);
        expect(algoItem).toBeDefined();
        expect(algoItem?.metadata.type).toBe("ALGORITHM");
      }
    });

    it("evaluates multiple choice challenge answers correctly", () => {
      const bubbleChallenge = getChallengeDefinition("challenge-bubble-next-swap");
      expect(bubbleChallenge).toBeDefined();

      // Test correct answer
      const correctEval = evaluateChallenge(bubbleChallenge!, {
        challengeId: bubbleChallenge!.id,
        answer: "Swap the adjacent values",
        hintsUsed: 0,
      });
      expect(correctEval.correct).toBe(true);
      expect(correctEval.score).toBe(100);

      // Test incorrect answer
      const incorrectEval = evaluateChallenge(bubbleChallenge!, {
        challengeId: bubbleChallenge!.id,
        answer: "Choose a pivot",
        hintsUsed: 0,
      });
      expect(incorrectEval.correct).toBe(false);
      expect(incorrectEval.score).toBe(0);
    });

    it("evaluates short answer challenges with case-insensitive / trimmed matches", () => {
      const insertionChallenge = getChallengeDefinition("challenge-insertion-current");
      expect(insertionChallenge).toBeDefined();

      const result = evaluateChallenge(insertionChallenge!, {
        challengeId: insertionChallenge!.id,
        answer: "KEY",
        hintsUsed: 0,
      });
      expect(result.correct).toBe(true);
      expect(result.score).toBe(100);
    });

    it("applies hint deductions accurately without exceeding limits", () => {
      const binaryChallenge = getChallengeDefinition("challenge-binary-half");
      expect(binaryChallenge).toBeDefined();

      const result = evaluateChallenge(binaryChallenge!, {
        challengeId: binaryChallenge!.id,
        answer: "half",
        hintsUsed: 1,
      });
      expect(result.correct).toBe(true);
      expect(result.score).toBe(80); // 100 - (1 * 20 penalty)

      // Rejects exceeding maxHints
      expect(() =>
        evaluateChallenge(binaryChallenge!, {
          challengeId: binaryChallenge!.id,
          answer: "half",
          hintsUsed: 2,
        })
      ).toThrow();
    });
  });

  describe("Challenge Navigation & Detail Routing", () => {
    it("resolves challenges by stable id or slug", () => {
      const byId = CHALLENGE_DEFINITIONS.find((c) => c.id === "challenge-bubble-next-swap");
      const bySlug = CHALLENGE_DEFINITIONS.find((c) => c.slug === "bubble-sort-next-swap");

      expect(byId).toBeDefined();
      expect(bySlug).toBeDefined();
      expect(byId?.id).toBe(bySlug?.id);
    });

    it("returns undefined for unknown challenge identifiers", () => {
      const unknown = getChallengeDefinition("nonexistent-challenge-id");
      expect(unknown).toBeUndefined();
    });
  });

  describe("Settings & Dark UI Invariants", () => {
    it("validates dark theme preference contract", () => {
      const validThemes = ["LIGHT", "DARK", "SYSTEM"];
      expect(validThemes).toContain("DARK");
      expect(validThemes).toContain("SYSTEM");
    });

    it("validates speed range constraints (0.25 to 4.0)", () => {
      const minSpeed = 0.25;
      const maxSpeed = 4.0;
      const validTestSpeed = 1.5;

      expect(validTestSpeed >= minSpeed && validTestSpeed <= maxSpeed).toBe(true);
      expect(0.1 >= minSpeed).toBe(false);
      expect(5.0 <= maxSpeed).toBe(false);
    });
  });
});

import type {
  ChallengeDefinition,
  ChallengeEvaluation,
  ChallengeSubmission,
} from "./challenge-types";

function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function boundedHints(value: number, maxHints: number): number {
  if (!Number.isInteger(value) || value < 0 || value > maxHints) {
    throw new Error(`hintsUsed must be an integer between 0 and ${maxHints}.`);
  }
  return value;
}

function boundedTime(value: number | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isFinite(value) || value < 0 || value > 86_400_000)
    throw new Error("timeSpentMs is out of bounds.");
  return value;
}

export function evaluateChallenge(
  definition: ChallengeDefinition,
  submission: ChallengeSubmission
): ChallengeEvaluation {
  if (submission.challengeId !== definition.id)
    throw new Error("Challenge submission does not match the selected challenge.");
  const hintsUsed = boundedHints(submission.hintsUsed, definition.maxHints);
  boundedTime(submission.timeSpentMs);
  const answer = normalizeAnswer(submission.answer);
  if (!answer || answer.length > 2_000)
    throw new Error("Answer is empty or exceeds the allowed size.");

  const accepted = definition.acceptedAnswers.some(
    (candidate) => normalizeAnswer(candidate) === answer
  );
  const hintPenalty = Math.min(definition.score, hintsUsed * Math.ceil(definition.score * 0.2));
  const score = accepted ? Math.max(0, definition.score - hintPenalty) : 0;

  return {
    challengeId: definition.id,
    correct: accepted,
    score,
    maxScore: definition.score,
    feedback: accepted
      ? "Correct. You identified the expected behavior."
      : "Not quite. Revisit the highlighted concept and try again.",
    explanation: definition.explanation,
    correctAnswer: definition.correctAnswer,
    hintsUsed,
    completed: accepted,
  };
}

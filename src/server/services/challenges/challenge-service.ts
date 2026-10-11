import { getChallengeDefinition } from "../../../content/challenges";
import {
  evaluateChallenge,
  type ChallengeEvaluation,
  type ChallengeSubmission,
} from "../../../core/challenges";
import type { ChallengeAttemptRepository } from "../../repositories/challenges/challenge-attempt-repository";

export interface ChallengeSubmissionServiceResult {
  evaluation: ChallengeEvaluation;
  persisted: boolean;
}

export async function submitChallenge(
  submission: ChallengeSubmission,
  options: { userId: string; contentVersionId?: string; repository: ChallengeAttemptRepository }
): Promise<ChallengeSubmissionServiceResult> {
  const definition = getChallengeDefinition(submission.challengeId);
  if (!definition) throw new Error("Challenge not found.");
  const evaluation = evaluateChallenge(definition, submission);

  await options.repository.save({
    userId: options.userId,
    contentItemId: definition.slug,
    contentVersionId: options.contentVersionId ?? "current",
    attemptNumber: 1,
    answer: submission.answer,
    hintsUsed: evaluation.hintsUsed,
    timeSpentMs: submission.timeSpentMs ?? null,
    evaluation,
  });

  return { evaluation, persisted: true };
}

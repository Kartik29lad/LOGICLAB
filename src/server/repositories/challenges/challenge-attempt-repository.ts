import type { ChallengeEvaluation } from "../../../core/challenges";

export interface ChallengeAttemptRecord {
  userId: string;
  contentItemId: string;
  contentVersionId: string;
  attemptNumber: number;
  answer: string;
  hintsUsed: number;
  timeSpentMs: number | null;
  evaluation: ChallengeEvaluation;
}

export interface ChallengeAttemptRepository {
  save(record: ChallengeAttemptRecord): Promise<void>;
}

/**
 * Challenge Repository Contract
 * Defines persistence abstraction for challenge submissions and scoring.
 */

export interface ChallengeAttemptEntity {
  id: string;
  userId: string;
  challengeId: string;
  passed: boolean;
  score: number;
  submittedCode?: string;
  createdAt: Date;
}

export interface IChallengeRepository {
  recordAttempt(
    attempt: Omit<ChallengeAttemptEntity, "id" | "createdAt">
  ): Promise<ChallengeAttemptEntity>;
  findAttemptsByUser(userId: string, challengeId?: string): Promise<ChallengeAttemptEntity[]>;
}

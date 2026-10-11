import type { ChallengeEvaluation, ChallengeSubmission } from "../../../core/challenges";

export interface ChallengeSubmitRequest extends Omit<ChallengeSubmission, "challengeId"> {
  challengeId: string;
}

export interface ChallengeSubmitResponse {
  evaluation: ChallengeEvaluation;
  persisted: boolean;
}

export interface ChallengeApiError {
  error: { code: string; message: string; requestId?: string };
}

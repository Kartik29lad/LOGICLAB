import type { Difficulty } from "../../content/schema/content-types";

export type ChallengeInteraction = "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "PREDICT_EVENT";

export interface ChallengeOption {
  id: string;
  label: string;
}

export interface ChallengeDefinition {
  id: string;
  slug: string;
  title: string;
  description: string;
  algorithmSlug: string;
  difficulty: Difficulty;
  interaction: ChallengeInteraction;
  prompt: string;
  options?: ChallengeOption[];
  acceptedAnswers: string[];
  correctAnswer: string;
  explanation: string;
  hints: string[];
  expectedInteraction?: string;
  relatedContentSlug: string;
  maxHints: number;
  score: number;
}

export interface ChallengeSubmission {
  challengeId: string;
  answer: string;
  hintsUsed: number;
  timeSpentMs?: number;
}

export interface ChallengeEvaluation {
  challengeId: string;
  correct: boolean;
  score: number;
  maxScore: number;
  feedback: string;
  explanation: string;
  correctAnswer: string;
  hintsUsed: number;
  completed: boolean;
}

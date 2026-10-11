import type { Difficulty } from "../content/schema/content-types";

/**
 * Public educational-content contracts. The source content schema is canonical;
 * this file is the stable contract export used by application boundaries.
 */
export * from "../content/schema/content-types";
export * from "../content/schema/content-validator";
export * from "../content/schema/content-hash";

export interface ChallengeTestCase<TInput = unknown, TExpected = unknown> {
  id: string;
  description: string;
  input: TInput;
  expectedOutput: TExpected;
  hidden?: boolean;
}

export interface ChallengeDefinition {
  id: string;
  algorithmSlug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  testCases: ChallengeTestCase[];
  hints: string[];
}

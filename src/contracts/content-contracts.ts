/**
 * Educational Content Item Contracts
 * Defines schemas for static repository-backed educational content.
 */

export type AlgorithmCategory = "sorting" | "searching" | "graph" | "tree" | "dynamic-programming";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface ComplexityProfile {
  timeBest: string;
  timeAverage: string;
  timeWorst: string;
  spaceComplexity: string;
  stable?: boolean;
  inPlace?: boolean;
}

export interface CodeImplementationSnippet {
  language: "typescript" | "javascript" | "python" | "java" | "cpp";
  code: string;
  lineHighlights?: Record<string, number[]>;
}

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
  difficulty: DifficultyLevel;
  testCases: ChallengeTestCase[];
  hints: string[];
}

export interface AlgorithmMetadata {
  slug: string;
  name: string;
  category: AlgorithmCategory;
  difficulty: DifficultyLevel;
  summary: string;
  complexity: ComplexityProfile;
  tags: string[];
}

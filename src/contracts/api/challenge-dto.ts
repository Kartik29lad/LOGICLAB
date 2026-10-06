/**
 * Challenge Submission DTO Contracts
 */

export interface SubmitChallengeRequestDto {
  challengeId: string;
  algorithmSlug: string;
  solutionCode?: string;
  userSteps?: number[];
  language?: string;
}

export interface TestCaseResultDto {
  testCaseId: string;
  passed: boolean;
  actualOutput?: unknown;
  expectedOutput?: unknown;
  executionTimeMs?: number;
  errorMessage?: string;
}

export interface SubmitChallengeResponseDto {
  challengeId: string;
  passed: boolean;
  score: number;
  totalTestCases: number;
  passedTestCases: number;
  results: TestCaseResultDto[];
  submittedAt: string;
}

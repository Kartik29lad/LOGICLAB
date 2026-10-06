/**
 * Algorithm Execution DTO Contracts
 */

import type { AlgorithmTrace } from "../events/trace-events";

export interface ExecuteAlgorithmRequestDto<TInput = unknown> {
  algorithmSlug: string;
  input: TInput;
  options?: {
    maxSteps?: number;
    recordMetrics?: boolean;
    speed?: number;
  };
}

export interface ExecuteAlgorithmResponseDto<TOutput = unknown, TState = unknown> {
  trace: AlgorithmTrace<unknown, TOutput, TState>;
  executedAt: string;
}

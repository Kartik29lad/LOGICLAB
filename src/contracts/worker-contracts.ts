/**
 * Web Worker Message Contracts
 * Defines communication schemas between main thread and background computation workers.
 */

import type { AlgorithmTrace } from "./events/trace-events";

export interface WorkerExecutionRequest<TInput = unknown> {
  id: string;
  type: "EXECUTE_ALGORITHM";
  algorithmSlug: string;
  input: TInput;
  options?: {
    maxSteps?: number;
    timeoutMs?: number;
    recordMetrics?: boolean;
  };
}

export interface WorkerExecutionSuccessResponse<TOutput = unknown, TState = unknown> {
  id: string;
  type: "EXECUTION_SUCCESS";
  trace: AlgorithmTrace<unknown, TOutput, TState>;
}

export interface WorkerExecutionErrorResponse {
  id: string;
  type: "EXECUTION_ERROR";
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type WorkerExecutionResponse = WorkerExecutionSuccessResponse | WorkerExecutionErrorResponse;

export interface WorkerProgressMessage {
  id: string;
  type: "EXECUTION_PROGRESS";
  currentStep: number;
}

export type WorkerMessage = WorkerExecutionResponse | WorkerProgressMessage;

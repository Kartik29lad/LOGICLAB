/**
 * Web Worker Message Contracts
 * Defines communication schemas between main thread and background computation workers.
 * Supports: START, PROGRESS, CANCEL, COMPLETE, ERROR
 */

import type { AlgorithmTrace } from "./events/trace-events";

export type WorkerMessageType = "START" | "PROGRESS" | "CANCEL" | "COMPLETE" | "ERROR";

export interface WorkerStartMessage<TInput = unknown> {
  id: string;
  type: "START";
  algorithmSlug: string;
  input: TInput;
  options?: {
    maxSteps?: number;
    timeoutMs?: number;
    recordMetrics?: boolean;
  };
}

export interface WorkerCancelMessage {
  id: string;
  type: "CANCEL";
}

export interface WorkerProgressMessage {
  id: string;
  type: "PROGRESS";
  currentStep: number;
}

export interface WorkerCompleteMessage<TOutput = unknown, TState = unknown> {
  id: string;
  type: "COMPLETE";
  trace: AlgorithmTrace<unknown, TOutput, TState>;
}

export interface WorkerErrorMessage {
  id: string;
  type: "ERROR";
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type WorkerInboundMessage<TInput = unknown> =
  WorkerStartMessage<TInput> | WorkerCancelMessage;

export type WorkerOutboundMessage<TOutput = unknown, TState = unknown> =
  WorkerProgressMessage | WorkerCompleteMessage<TOutput, TState> | WorkerErrorMessage;

// Backwards compatibility aliases
export type WorkerExecutionRequest<TInput = unknown> = WorkerStartMessage<TInput>;
export type WorkerExecutionSuccessResponse<
  TOutput = unknown,
  TState = unknown,
> = WorkerCompleteMessage<TOutput, TState>;
export type WorkerExecutionErrorResponse = WorkerErrorMessage;
export type WorkerExecutionResponse = WorkerCompleteMessage | WorkerErrorMessage;
export type WorkerMessage = WorkerOutboundMessage;

import type { ExecutionEventType } from "@/contracts/events/trace-events";

export interface AlgorithmStepObserver {
  emit(type: ExecutionEventType, payload?: Record<string, unknown>, stateAfter?: unknown): void;
}

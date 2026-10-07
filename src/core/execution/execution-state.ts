export type ExecutionStatus =
  | "CREATED"
  | "VALIDATED"
  | "INITIALIZED"
  | "RUNNING"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

const VALID_TRANSITIONS: Record<ExecutionStatus, ExecutionStatus[]> = {
  CREATED: ["VALIDATED", "FAILED"],
  VALIDATED: ["INITIALIZED", "FAILED"],
  INITIALIZED: ["RUNNING", "CANCELLED", "FAILED"],
  RUNNING: ["PAUSED", "COMPLETED", "FAILED", "CANCELLED"],
  PAUSED: ["RUNNING", "INITIALIZED", "CANCELLED", "FAILED"],
  COMPLETED: ["INITIALIZED", "CREATED"],
  FAILED: ["INITIALIZED", "CREATED"],
  CANCELLED: ["INITIALIZED", "CREATED"],
};

/**
 * Validates deterministic state machine transitions for the execution lifecycle.
 */
export function isValidExecutionTransition(from: ExecutionStatus, to: ExecutionStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

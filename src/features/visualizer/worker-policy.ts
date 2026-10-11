/**
 * Phase 12 worker policy. Small deterministic traces stay on the main thread;
 * measured heavy executions may be promoted to the worker contract in a later
 * execution adapter without changing the playback API.
 */
export const WORKER_STEP_THRESHOLD = 2_000;
export const WORKER_INPUT_THRESHOLD = 50_000;

export interface WorkerPolicyInput {
  estimatedSteps: number;
  inputSize: number;
}
export function shouldUseExecutionWorker(input: WorkerPolicyInput): boolean {
  return input.estimatedSteps >= WORKER_STEP_THRESHOLD || input.inputSize >= WORKER_INPUT_THRESHOLD;
}

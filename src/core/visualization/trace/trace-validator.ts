import type {
  CanonicalExecutionTrace,
  ExecutionTraceStep,
} from "../../../contracts/events/trace-events";
import { TraceValidationError } from "./trace-errors";
import { validateTraceInvariants } from "./trace-invariants";

const equal = (left: unknown, right: unknown): boolean =>
  JSON.stringify(left) === JSON.stringify(right);

export function validateExecutionTrace<TInput, TOutput, TState>(
  trace: CanonicalExecutionTrace<TInput, TOutput, TState>
): void {
  if (!trace.executionId || !trace.algorithmSlug)
    throw new TraceValidationError("Trace identity is required.");
  if (
    trace.status === "completed" &&
    trace.steps.length === 0 &&
    trace.initialState === undefined
  ) {
    throw new TraceValidationError("Completed traces require an initial state.");
  }
  for (let index = 0; index < trace.steps.length; index += 1) {
    validateStep(trace.steps[index], index, trace.steps[index - 1]);
  }
  const last = trace.steps.at(-1);
  if (last && !equal(last.stateAfter, trace.finalState)) {
    throw new TraceValidationError("Final trace state does not equal the final step state.");
  }
  validateTraceInvariants(trace);
  for (let index = 1; index < trace.steps.length; index += 1) {
    const previous = trace.steps[index - 1].metrics;
    const current = trace.steps[index].metrics;
    for (const key of [
      "comparisons",
      "swaps",
      "reads",
      "writes",
      "visits",
      "iterations",
    ] as const) {
      if (current[key] < previous[key]) {
        throw new TraceValidationError(`Metric ${key} decreased at step ${index}.`);
      }
    }
  }
  if (
    trace.steps.some(
      (step) =>
        step.metrics.comparisons < 0 ||
        step.metrics.swaps < 0 ||
        step.metrics.writes < 0 ||
        step.metrics.reads < 0 ||
        step.metrics.visits < 0 ||
        step.metrics.iterations < 0
    )
  ) {
    throw new TraceValidationError("Trace metrics cannot be negative.");
  }
}

function validateStep<TState>(
  step: ExecutionTraceStep<TState>,
  expectedIndex: number,
  previous?: ExecutionTraceStep<TState>
): void {
  if (step.stepIndex !== expectedIndex)
    throw new TraceValidationError(`Invalid step ordering at ${step.stepIndex}.`);
  if (previous && !equal(previous.stateAfter, step.stateBefore)) {
    throw new TraceValidationError(
      `Step ${step.stepIndex} does not start from the previous state.`
    );
  }
  if (step.event.stepIndex !== step.stepIndex)
    throw new TraceValidationError(`Event/step index mismatch at ${step.stepIndex}.`);
  if (!step.event.type) throw new TraceValidationError(`Step ${step.stepIndex} has no event type.`);
  if (step.event.stateAfter !== undefined && !equal(step.event.stateAfter, step.stateAfter)) {
    throw new TraceValidationError(`Event stateAfter mismatch at step ${step.stepIndex}.`);
  }
}

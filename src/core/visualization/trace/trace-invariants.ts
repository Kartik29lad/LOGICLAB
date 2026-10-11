import type {
  CanonicalExecutionEvent,
  CanonicalExecutionTrace,
} from "../../../contracts/events/trace-events";
import { TraceValidationError } from "./trace-errors";

export interface TraceInvariantContext<TState> {
  previousState?: TState;
  event: CanonicalExecutionEvent<TState>;
  stateBefore: TState;
  stateAfter: TState;
}

export interface TraceInvariantOptions<TState> {
  resolveReference?: (
    reference: NonNullable<CanonicalExecutionEvent<TState>["references"]>[number],
    state: TState
  ) => boolean;
  validateTransition?: (context: TraceInvariantContext<TState>) => void;
}

export function validateTraceInvariants<TInput, TOutput, TState>(
  trace: CanonicalExecutionTrace<TInput, TOutput, TState>,
  options: TraceInvariantOptions<TState> = {}
): void {
  for (let index = 0; index < trace.steps.length; index += 1) {
    const step = trace.steps[index];
    if (step.stepIndex !== index)
      throw new TraceValidationError(`Step ordering is invalid at ${index}.`);
    for (const reference of step.event.references ?? []) {
      if (reference.id === "" || reference.id === undefined) {
        throw new TraceValidationError(`Event ${index} contains an empty entity reference.`);
      }
      if (options.resolveReference && !options.resolveReference(reference, step.stateBefore)) {
        throw new TraceValidationError(`Event ${index} references an entity that does not exist.`);
      }
    }
    options.validateTransition?.({
      previousState: trace.steps[index - 1]?.stateAfter,
      event: step.event,
      stateBefore: step.stateBefore,
      stateAfter: step.stateAfter,
    });
  }
}

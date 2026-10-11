import type {
  CanonicalExecutionEvent,
  CanonicalExecutionTrace,
  ExecutionTraceStep,
  TraceMetricSnapshot,
} from "../../../contracts/events/trace-events";
import { TraceValidationError } from "./trace-errors";

const clone = <T>(value: T): T => structuredClone(value);

const zeroMetrics: TraceMetricSnapshot = {
  comparisons: 0,
  swaps: 0,
  reads: 0,
  writes: 0,
  visits: 0,
  iterations: 0,
  elapsedMs: 0,
};

export class TraceBuilder<TInput, TOutput, TState> {
  private readonly steps: ExecutionTraceStep<TState>[] = [];
  private lastState: TState;

  constructor(
    private readonly executionId: string,
    private readonly algorithmSlug: string,
    private readonly input: TInput,
    initialState: TState
  ) {
    this.lastState = clone(initialState);
  }

  public append<TPayload>(event: CanonicalExecutionEvent<TState, TPayload>): void {
    const expected = this.steps.length;
    if (event.stepIndex !== expected) {
      throw new TraceValidationError(`Expected step ${expected}, received ${event.stepIndex}.`);
    }
    const before = clone(event.stateBefore ?? this.lastState);
    if (!this.statesEqual(before, this.lastState)) {
      throw new TraceValidationError(
        `Step ${event.stepIndex} stateBefore does not match the previous state.`
      );
    }
    const after = clone(event.stateAfter ?? before);
    const metrics = event.metrics ? clone(event.metrics) : clone(zeroMetrics);
    this.steps.push({
      stepIndex: event.stepIndex,
      event: clone(event),
      stateBefore: before,
      stateAfter: after,
      metrics,
    });
    this.lastState = after;
  }

  public build(
    output: TOutput | undefined,
    status: CanonicalExecutionTrace<TInput, TOutput, TState>["status"],
    metrics: TraceMetricSnapshot
  ): CanonicalExecutionTrace<TInput, TOutput, TState> {
    if (
      status === "completed" &&
      this.steps.length > 0 &&
      !this.statesEqual(this.lastState, this.steps[this.steps.length - 1].stateAfter)
    ) {
      throw new TraceValidationError("Trace final state is inconsistent with its final step.");
    }
    return {
      executionId: this.executionId,
      algorithmSlug: this.algorithmSlug,
      input: clone(this.input),
      output: output === undefined ? undefined : clone(output),
      initialState: clone(this.steps[0]?.stateBefore ?? this.lastState),
      steps: clone(this.steps),
      finalState: clone(this.lastState),
      metrics: clone(metrics),
      status,
    };
  }

  private statesEqual(left: TState, right: TState): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
  }
}

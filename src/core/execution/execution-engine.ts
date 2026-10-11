import type {
  AlgorithmDefinition,
  ExecutionController,
  ExecutionEvent,
  ExecutionLifecycleStatus,
  ExecutionLimits,
  ExecutionResult,
  ExecutionTrace,
} from "../../contracts/execution";
import { InputNormalizer, type ExecutionInputKind } from "../input/normalization";
import { ExecutionBudgetExceededError, ExecutionEngineError } from "./execution-errors";
import { ExecutionMetricsCollector } from "./execution-metrics";
import { ExecutionRuntime } from "./execution-runtime";

export interface ExecutionEngineOptions {
  executionId: string;
  algorithmSlug: string;
  inputKind: ExecutionInputKind;
  limits: ExecutionLimits;
  normalizer?: InputNormalizer;
  metadata?: Readonly<Record<string, string | number | boolean>>;
}

export interface ExecutionSession<TOutput = unknown, TState = unknown> {
  readonly controller: ExecutionController;
  /** Resolves for the execution currently represented by the session. After restart, access this getter again. */
  readonly promise: Promise<ExecutionResult<TOutput, TState>>;
  readonly getStatus: () => ExecutionLifecycleStatus;
}

export class ExecutionEngine {
  public create<TOutput, TState, TEvent extends ExecutionEvent = ExecutionEvent>(
    definition: AlgorithmDefinition<unknown, TOutput, TState, TEvent>,
    rawInput: unknown,
    options: ExecutionEngineOptions
  ): ExecutionSession<TOutput, TState> {
    this.validateLimits(options.limits);
    if (options.limits.maxWorkerMemoryMb !== undefined) {
      throw new ExecutionEngineError(
        "maxWorkerMemoryMb is reserved for worker-backed execution and is not enforceable in Phase 6."
      );
    }
    const normalized = (
      options.normalizer ??
      new InputNormalizer({
        maxInputSize: options.limits.maxInputSize ?? 10_000,
        maxStringLength: options.limits.maxStringLength ?? 10_000,
        maxGraphNodes: options.limits.maxGraphNodes ?? 1_000,
        maxGraphEdges: options.limits.maxGraphEdges ?? 5_000,
        maxOperations: options.limits.maxOperations ?? 5_000,
      })
    ).normalize(options.inputKind, rawInput);
    definition.validateInput(normalized);

    let runtime = new ExecutionRuntime(options.limits);
    let currentRunPromise: Promise<ExecutionResult<TOutput, TState>> | undefined;
    let started = false;
    let generation = 0;

    const execute = async (
      currentGeneration: number
    ): Promise<ExecutionResult<TOutput, TState>> => {
      runtime.transition("validated");
      runtime.transition("initialized");
      runtime.transition("running");
      const events: TEvent[] = [];
      const metrics = new ExecutionMetricsCollector();
      const emit = (event: TEvent): void => {
        runtime.registerEvent();
        events.push(event);
      };

      try {
        const result = await definition.execute(
          {
            executionId: options.executionId,
            algorithmSlug: options.algorithmSlug,
            input: normalized,
            limits: options.limits,
            cancellation: runtime,
            metrics,
            checkpoint: () => runtime.checkpoint(),
            getStatus: () => runtime.currentStatus,
            metadata: options.metadata,
          },
          emit
        );
        if (currentGeneration !== generation) {
          return this.cancelledResult(options, normalized, events, metrics);
        }
        runtime.finish("completed");
        const trace: ExecutionTrace<unknown, TOutput, TState, TEvent> = {
          executionId: options.executionId,
          algorithmSlug: options.algorithmSlug,
          input: normalized,
          output: result.output,
          finalState: result.finalState,
          events: events.length > 0 ? events : result.trace.events,
          metrics: metrics.snapshot(),
          status: "completed",
        };
        return { output: result.output, finalState: result.finalState, trace };
      } catch (error) {
        if (
          runtime.aborted ||
          runtime.currentStatus === "cancelled" ||
          error instanceof ExecutionBudgetExceededError
        ) {
          runtime.cancel(error instanceof ExecutionBudgetExceededError ? error.message : undefined);
          return this.cancelledResult(options, normalized, events, metrics);
        }
        if (runtime.currentStatus !== "failed") {
          try {
            runtime.finish("failed");
          } catch {
            // Preserve the original execution failure.
          }
        }
        throw error;
      }
    };

    const start = (): Promise<void> => {
      if (started) return currentRunPromise!.then(() => undefined);
      started = true;
      currentRunPromise = execute(generation);
      return currentRunPromise.then(() => undefined);
    };

    const controller: ExecutionController = {
      start,
      pause: () => runtime.pause(),
      resume: () => runtime.resume(),
      restart: async () => {
        runtime.cancel("Execution restarted.");
        generation += 1;
        runtime = new ExecutionRuntime(options.limits);
        started = false;
        currentRunPromise = undefined;
        await start();
      },
      cancel: () => runtime.cancel(),
      reset: () => {
        if (runtime.currentStatus === "running" || runtime.currentStatus === "paused") {
          runtime.cancel("Execution reset.");
        }
        generation += 1;
        runtime = new ExecutionRuntime(options.limits);
        started = false;
        currentRunPromise = undefined;
      },
      stepForward: () => runtime.stepForward(),
      getStatus: () => runtime.currentStatus,
    };

    return {
      controller,
      get promise(): Promise<ExecutionResult<TOutput, TState>> {
        if (!currentRunPromise) {
          currentRunPromise = new Promise<ExecutionResult<TOutput, TState>>(() => undefined);
        }
        return currentRunPromise;
      },
      getStatus: () => runtime.currentStatus,
    };
  }

  private cancelledResult<TOutput, TState, TEvent extends ExecutionEvent>(
    options: ExecutionEngineOptions,
    normalized: unknown,
    events: TEvent[],
    metrics: ExecutionMetricsCollector
  ): ExecutionResult<TOutput, TState, TEvent> {
    return {
      trace: {
        executionId: options.executionId,
        algorithmSlug: options.algorithmSlug,
        input: normalized,
        events,
        metrics: metrics.snapshot(),
        status: "cancelled",
      },
    };
  }

  private validateLimits(limits: ExecutionLimits): void {
    const required: Array<[string, number]> = [
      ["maxSteps", limits.maxSteps],
      ["maxRuntimeMs", limits.maxRuntimeMs],
    ];
    for (const [name, value] of required) {
      if (!Number.isInteger(value) || value <= 0) {
        throw new ExecutionEngineError(`${name} must be a positive integer.`);
      }
    }
    const boundedIntegerFields = [
      "maxInputSize",
      "maxTraceEvents",
      "maxGraphNodes",
      "maxGraphEdges",
      "maxOperations",
      "maxStringLength",
    ] as const;
    for (const name of boundedIntegerFields) {
      const value = limits[name];
      if (value !== undefined && (!Number.isInteger(value) || value <= 0)) {
        throw new ExecutionEngineError(`${name} must be a positive integer when provided.`);
      }
    }
  }
}

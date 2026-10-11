import type {
  AlgorithmDefinition,
  ExecutionEvent,
  ExecutionResult,
} from "../../contracts/execution";
import type { NormalizedArrayInput } from "../input/normalization";

export interface ArrayExecutionEvent extends ExecutionEvent<{ values?: number[] }> {
  type: "START" | "COMPLETE" | "READ" | "WRITE";
}

export function createArrayAlgorithmDefinition<TOutput>(config: {
  id: string;
  slug: string;
  validate?: (input: NormalizedArrayInput) => void;
  execute: (values: readonly number[]) => TOutput;
}): AlgorithmDefinition<NormalizedArrayInput, TOutput, NormalizedArrayInput, ArrayExecutionEvent> {
  return {
    id: config.id,
    slug: config.slug,
    validateInput: (input) => {
      if (input.kind !== "array")
        throw new TypeError("This algorithm requires normalized array input.");
      config.validate?.(input);
    },
    execute: async (
      context,
      emit
    ): Promise<ExecutionResult<TOutput, NormalizedArrayInput, ArrayExecutionEvent>> => {
      emit({ stepIndex: 0, type: "START", payload: { values: [...context.input.values] } });
      context.metrics?.increment("iterations");
      await context.checkpoint?.();
      context.cancellation?.throwIfAborted?.();
      const output = config.execute(context.input.values);
      await context.checkpoint?.();
      emit({ stepIndex: 1, type: "COMPLETE", payload: { values: [...context.input.values] } });
      return {
        output,
        finalState: { kind: "array", values: [...context.input.values] },
        trace: {
          executionId: context.executionId,
          algorithmSlug: context.algorithmSlug,
          input: context.input,
          events: [],
          metrics: context.metrics?.snapshot() ?? {
            comparisons: 0,
            swaps: 0,
            reads: 0,
            writes: 0,
            visits: 0,
            iterations: 0,
            elapsedMs: 0,
          },
          status: "completed",
        },
      };
    },
  };
}

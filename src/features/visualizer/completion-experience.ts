import type { CanonicalExecutionTrace } from "@/contracts/events/trace-events";

export interface CompletionSummary {
  steps: number;
  comparisons: number;
  swaps: number;
  writes: number;
  visits: number;
  result: string;
}

export function buildCompletionSummary(
  trace: CanonicalExecutionTrace<unknown, unknown, unknown>
): CompletionSummary {
  const metrics = trace.metrics as unknown as Record<string, number> | undefined;
  const last = trace.steps.at(-1);
  return {
    steps: trace.steps.length,
    comparisons: metrics?.comparisons ?? 0,
    swaps: metrics?.swaps ?? 0,
    writes: metrics?.writes ?? 0,
    visits: metrics?.visits ?? 0,
    result: last?.event.description ?? "Execution completed successfully.",
  };
}

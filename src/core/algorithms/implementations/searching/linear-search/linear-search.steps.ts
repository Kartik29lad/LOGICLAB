import type {
  AlgorithmTrace,
  ExecutionStep,
  TraceMetrics,
} from "../../../../../contracts/events/trace-events";
import { ExecutionContext } from "../../../../execution/execution-context";

/**
 * Builds step-by-step execution trace for Linear Search.
 */
export function buildLinearSearchSteps(
  input: readonly number[],
  target: number,
  context = new ExecutionContext()
): AlgorithmTrace<{ array: number[]; target: number }, number, number[]> {
  const array = [...input];
  const steps: ExecutionStep<number[]>[] = [];
  const metrics: TraceMetrics = {
    comparisons: 0,
    swaps: 0,
    accessCount: 0,
    iterations: 0,
  };

  let foundIndex = -1;

  for (let i = 0; i < array.length; i++) {
    context.recordStep();
    metrics.iterations++;
    metrics.comparisons++;
    metrics.accessCount++;

    const currentVal = array[i]!;

    steps.push({
      stepIndex: steps.length,
      action: "compare",
      description: `Checking index ${i} (${currentVal}) against target ${target}.`,
      stateSnapshot: [...array],
      highlights: [{ indices: [i], colorRole: "active" }],
      pointers: [{ name: "i", index: i, label: `Index ${i}` }],
      metrics: { ...metrics },
    });

    if (currentVal === target) {
      foundIndex = i;
      context.recordStep();
      steps.push({
        stepIndex: steps.length,
        action: "complete",
        description: `Target ${target} found at index ${i}!`,
        stateSnapshot: [...array],
        highlights: [{ indices: [i], colorRole: "sorted" }],
        pointers: [{ name: "found", index: i }],
        metrics: { ...metrics },
      });
      break;
    }
  }

  if (foundIndex === -1) {
    context.recordStep();
    steps.push({
      stepIndex: steps.length,
      action: "complete",
      description: `Target ${target} was not found in the array.`,
      stateSnapshot: [...array],
      highlights: [],
      pointers: [],
      metrics: { ...metrics },
    });
  }

  return {
    algorithmSlug: "linear-search",
    category: "searching",
    input: { array: [...input], target },
    output: foundIndex,
    steps,
    totalSteps: steps.length,
    finalMetrics: { ...metrics },
    completed: true,
  };
}

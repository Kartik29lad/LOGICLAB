import type {
  AlgorithmTrace,
  ExecutionStep,
  TraceMetrics,
} from "../../../../../contracts/events/trace-events";
import { ExecutionContext } from "../../../../execution/execution-context";

/**
 * Builds step-by-step execution trace for Binary Search.
 */
export function buildBinarySearchSteps(
  sortedInput: readonly number[],
  target: number,
  context = new ExecutionContext()
): AlgorithmTrace<{ array: number[]; target: number }, number, number[]> {
  const array = [...sortedInput];
  const steps: ExecutionStep<number[]>[] = [];
  const metrics: TraceMetrics = {
    comparisons: 0,
    swaps: 0,
    accessCount: 0,
    iterations: 0,
  };

  let low = 0;
  let high = array.length - 1;
  let foundIndex = -1;

  while (low <= high) {
    context.recordStep();
    metrics.iterations++;

    const mid = Math.floor((low + high) / 2);
    const midVal = array[mid]!;

    metrics.comparisons++;
    metrics.accessCount++;

    steps.push({
      stepIndex: steps.length,
      action: "compare",
      description: `Searching interval [${low}..${high}]. Checking middle element at index ${mid} (${midVal}) against target ${target}.`,
      stateSnapshot: [...array],
      highlights: [
        { indices: [mid], colorRole: "active" },
        { indices: [low, high], colorRole: "secondary" },
      ],
      pointers: [
        { name: "low", index: low },
        { name: "mid", index: mid },
        { name: "high", index: high },
      ],
      metrics: { ...metrics },
    });

    if (midVal === target) {
      foundIndex = mid;
      context.recordStep();
      steps.push({
        stepIndex: steps.length,
        action: "complete",
        description: `Target ${target} found at index ${mid}!`,
        stateSnapshot: [...array],
        highlights: [{ indices: [mid], colorRole: "sorted" }],
        pointers: [{ name: "found", index: mid }],
        metrics: { ...metrics },
      });
      break;
    }

    if (midVal < target) {
      context.recordStep();
      steps.push({
        stepIndex: steps.length,
        action: "select",
        description: `${midVal} < ${target}. Discarding left half; updating low boundary to ${mid + 1}.`,
        stateSnapshot: [...array],
        highlights: [{ indices: [mid], colorRole: "comparison" }],
        pointers: [
          { name: "low", index: mid + 1 },
          { name: "high", index: high },
        ],
        metrics: { ...metrics },
      });
      low = mid + 1;
    } else {
      context.recordStep();
      steps.push({
        stepIndex: steps.length,
        action: "select",
        description: `${midVal} > ${target}. Discarding right half; updating high boundary to ${mid - 1}.`,
        stateSnapshot: [...array],
        highlights: [{ indices: [mid], colorRole: "comparison" }],
        pointers: [
          { name: "low", index: low },
          { name: "high", index: mid - 1 },
        ],
        metrics: { ...metrics },
      });
      high = mid - 1;
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
    algorithmSlug: "binary-search",
    category: "searching",
    input: { array: [...sortedInput], target },
    output: foundIndex,
    steps,
    totalSteps: steps.length,
    finalMetrics: { ...metrics },
    completed: true,
  };
}

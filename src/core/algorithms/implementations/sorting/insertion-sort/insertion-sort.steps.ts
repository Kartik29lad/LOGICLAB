import type {
  AlgorithmTrace,
  ExecutionStep,
  TraceMetrics,
} from "../../../../../contracts/events/trace-events";
import { ExecutionContext } from "../../../../execution/execution-context";

/**
 * Builds step-by-step execution trace for Insertion Sort.
 */
export function buildInsertionSortSteps(
  input: readonly number[],
  context = new ExecutionContext()
): AlgorithmTrace<number[], number[], number[]> {
  const array = [...input];
  const steps: ExecutionStep<number[]>[] = [];
  const metrics: TraceMetrics = {
    comparisons: 0,
    swaps: 0,
    accessCount: 0,
    iterations: 0,
  };

  const n = array.length;

  for (let i = 1; i < n; i++) {
    metrics.iterations++;
    const key = array[i]!;
    let j = i - 1;

    context.recordStep();
    steps.push({
      stepIndex: steps.length,
      action: "select",
      description: `Selected element ${key} at index ${i} to insert into sorted sub-array [0..${i - 1}].`,
      stateSnapshot: [...array],
      highlights: [{ indices: [i], colorRole: "active" }],
      pointers: [{ name: "key", index: i, label: `Key: ${key}` }],
      metrics: { ...metrics },
    });

    while (j >= 0) {
      context.recordStep();
      metrics.comparisons++;
      metrics.accessCount++;

      steps.push({
        stepIndex: steps.length,
        action: "compare",
        description: `Comparing key ${key} with element ${array[j]} at index ${j}.`,
        stateSnapshot: [...array],
        highlights: [{ indices: [j, j + 1], colorRole: "comparison" }],
        pointers: [
          { name: "j", index: j },
          { name: "key", index: j + 1 },
        ],
        metrics: { ...metrics },
      });

      if (array[j]! > key) {
        array[j + 1] = array[j]!;
        metrics.swaps++;
        metrics.accessCount++;

        context.recordStep();
        steps.push({
          stepIndex: steps.length,
          action: "swap",
          description: `Shifted element ${array[j]} right to index ${j + 1}.`,
          stateSnapshot: [...array],
          highlights: [{ indices: [j + 1], colorRole: "secondary" }],
          pointers: [{ name: "j", index: j }],
          metrics: { ...metrics },
        });

        j--;
      } else {
        break;
      }
    }

    array[j + 1] = key;
    context.recordStep();
    steps.push({
      stepIndex: steps.length,
      action: "insert",
      description: `Inserted key ${key} into position ${j + 1}.`,
      stateSnapshot: [...array],
      highlights: [{ indices: [j + 1], colorRole: "sorted" }],
      pointers: [{ name: "inserted", index: j + 1 }],
      metrics: { ...metrics },
    });
  }

  // Completion Step
  context.recordStep();
  steps.push({
    stepIndex: steps.length,
    action: "complete",
    description: "Insertion sort complete. Array is sorted.",
    stateSnapshot: [...array],
    highlights: [{ indices: array.map((_, idx) => idx), colorRole: "sorted" }],
    pointers: [],
    metrics: { ...metrics },
  });

  return {
    algorithmSlug: "insertion-sort",
    category: "sorting",
    input: [...input],
    output: array,
    steps,
    totalSteps: steps.length,
    finalMetrics: { ...metrics },
    completed: true,
  };
}

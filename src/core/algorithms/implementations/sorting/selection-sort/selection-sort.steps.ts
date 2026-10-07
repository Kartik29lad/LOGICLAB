import type {
  AlgorithmTrace,
  ExecutionStep,
  TraceMetrics,
} from "../../../../../contracts/events/trace-events";
import { ExecutionContext } from "../../../../execution/execution-context";

/**
 * Builds step-by-step execution trace for Selection Sort.
 */
export function buildSelectionSortSteps(
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

  for (let i = 0; i < n - 1; i++) {
    metrics.iterations++;
    let minIndex = i;

    context.recordStep();
    steps.push({
      stepIndex: steps.length,
      action: "select",
      description: `Starting search for minimum element starting at index ${i} (current candidate: ${array[i]}).`,
      stateSnapshot: [...array],
      highlights: [{ indices: [i], colorRole: "active" }],
      pointers: [
        { name: "i", index: i },
        { name: "min", index: minIndex },
      ],
      metrics: { ...metrics },
    });

    for (let j = i + 1; j < n; j++) {
      context.recordStep();
      metrics.comparisons++;
      metrics.accessCount += 2;

      steps.push({
        stepIndex: steps.length,
        action: "compare",
        description: `Comparing candidate min (${array[minIndex]}) with element at index ${j} (${array[j]}).`,
        stateSnapshot: [...array],
        highlights: [{ indices: [minIndex, j], colorRole: "comparison" }],
        pointers: [
          { name: "min", index: minIndex },
          { name: "j", index: j },
        ],
        metrics: { ...metrics },
      });

      if (array[j]! < array[minIndex]!) {
        minIndex = j;
        context.recordStep();
        steps.push({
          stepIndex: steps.length,
          action: "select",
          description: `Found new minimum element: ${array[minIndex]} at index ${minIndex}.`,
          stateSnapshot: [...array],
          highlights: [{ indices: [minIndex], colorRole: "secondary" }],
          pointers: [
            { name: "i", index: i },
            { name: "min", index: minIndex },
          ],
          metrics: { ...metrics },
        });
      }
    }

    if (minIndex !== i) {
      const temp = array[i]!;
      array[i] = array[minIndex]!;
      array[minIndex] = temp;
      metrics.swaps++;
      metrics.accessCount += 2;

      context.recordStep();
      steps.push({
        stepIndex: steps.length,
        action: "swap",
        description: `Swapped minimum element ${array[i]} to sorted position ${i}.`,
        stateSnapshot: [...array],
        highlights: [{ indices: [i, minIndex], colorRole: "secondary" }],
        pointers: [
          { name: "i", index: i },
          { name: "min", index: minIndex },
        ],
        metrics: { ...metrics },
      });
    }

    // Mark index i as sorted
    context.recordStep();
    steps.push({
      stepIndex: steps.length,
      action: "mark-sorted",
      description: `Index ${i} is now sorted.`,
      stateSnapshot: [...array],
      highlights: [{ indices: [i], colorRole: "sorted" }],
      pointers: [{ name: "sorted", index: i }],
      metrics: { ...metrics },
    });
  }

  // Completion Step
  context.recordStep();
  steps.push({
    stepIndex: steps.length,
    action: "complete",
    description: "Selection sort complete. Array is fully sorted.",
    stateSnapshot: [...array],
    highlights: [{ indices: array.map((_, idx) => idx), colorRole: "sorted" }],
    pointers: [],
    metrics: { ...metrics },
  });

  return {
    algorithmSlug: "selection-sort",
    category: "sorting",
    input: [...input],
    output: array,
    steps,
    totalSteps: steps.length,
    finalMetrics: { ...metrics },
    completed: true,
  };
}

import type {
  AlgorithmTrace,
  ExecutionStep,
  TraceMetrics,
} from "../../../../../contracts/events/trace-events";
import { ExecutionContext } from "../../../../execution/execution-context";

/**
 * Builds step-by-step execution trace for Bubble Sort.
 */
export function buildBubbleSortSteps(
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
    let swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      context.recordStep();
      metrics.comparisons++;
      metrics.accessCount += 2;

      const valA = array[j]!;
      const valB = array[j + 1]!;

      // 1. Comparison Step
      steps.push({
        stepIndex: steps.length,
        action: "compare",
        description: `Comparing elements at indices ${j} (${valA}) and ${j + 1} (${valB}).`,
        stateSnapshot: [...array],
        highlights: [{ indices: [j, j + 1], colorRole: "comparison" }],
        pointers: [
          { name: "j", index: j, label: `Index ${j}` },
          { name: "j+1", index: j + 1, label: `Index ${j + 1}` },
        ],
        metrics: { ...metrics },
      });

      if (valA > valB) {
        // 2. Swap Step
        array[j] = valB;
        array[j + 1] = valA;
        metrics.swaps++;
        metrics.accessCount += 2;
        swapped = true;

        context.recordStep();
        steps.push({
          stepIndex: steps.length,
          action: "swap",
          description: `Swapped elements: ${valA} > ${valB}.`,
          stateSnapshot: [...array],
          highlights: [{ indices: [j, j + 1], colorRole: "secondary" }],
          pointers: [
            { name: "j", index: j },
            { name: "j+1", index: j + 1 },
          ],
          metrics: { ...metrics },
        });
      }
    }

    // 3. Mark the element placed at end as sorted
    const sortedIdx = n - i - 1;
    context.recordStep();
    steps.push({
      stepIndex: steps.length,
      action: "mark-sorted",
      description: `Element ${array[sortedIdx]} at index ${sortedIdx} is in its final sorted position.`,
      stateSnapshot: [...array],
      highlights: [{ indices: [sortedIdx], colorRole: "sorted" }],
      pointers: [{ name: "sorted", index: sortedIdx }],
      metrics: { ...metrics },
    });

    if (!swapped) break;
  }

  // Completion Step
  context.recordStep();
  steps.push({
    stepIndex: steps.length,
    action: "complete",
    description: "Bubble sort complete. All elements are sorted.",
    stateSnapshot: [...array],
    highlights: [{ indices: array.map((_, idx) => idx), colorRole: "sorted" }],
    pointers: [],
    metrics: { ...metrics },
  });

  return {
    algorithmSlug: "bubble-sort",
    category: "sorting",
    input: [...input],
    output: array,
    steps,
    totalSteps: steps.length,
    finalMetrics: { ...metrics },
    completed: true,
  };
}

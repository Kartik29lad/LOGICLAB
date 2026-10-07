import type { AlgorithmTrace } from "../../../contracts/events/trace-events";

export interface TraceValidationResult {
  isValid: boolean;
  errors: string[];
}

export class TraceValidator {
  private static readonly VALID_ACTIONS = new Set([
    "compare",
    "swap",
    "write",
    "read",
    "insert",
    "remove",
    "visit",
    "enqueue",
    "dequeue",
    "push",
    "pop",
    "relax",
    "set-current",
    "found",
    "not-found",
    "mark-sorted",
    "select",
    "pivot",
    "backtrack",
    "complete",
  ]);

  /**
   * Validates all architectural trace invariants for an AlgorithmTrace.
   */
  public static validate(trace: AlgorithmTrace): TraceValidationResult {
    const errors: string[] = [];

    if (!trace.steps || trace.steps.length === 0) {
      errors.push("Trace must contain at least one step.");
      return { isValid: false, errors };
    }

    let prevComparisons = 0;
    let prevSwaps = 0;
    let hasCompleted = false;

    for (let i = 0; i < trace.steps.length; i++) {
      const step = trace.steps[i]!;

      // 1. Monotonically ordered step indices
      if (step.stepIndex !== i) {
        errors.push(
          `Step ordering violation at position ${i}: expected stepIndex ${i}, found ${step.stepIndex}.`
        );
      }

      // 2. Recognized action types
      const normalizedAction = String(step.action).toLowerCase();
      if (!this.VALID_ACTIONS.has(normalizedAction)) {
        errors.push(`Invalid step action "${step.action}" at step ${i}.`);
      }

      // 3. Entity and index boundary checking for array snapshots
      if (Array.isArray(step.stateSnapshot)) {
        const arrLen = step.stateSnapshot.length;
        for (const highlight of step.highlights ?? []) {
          for (const idx of highlight.indices) {
            if (typeof idx === "number" && (idx < 0 || idx >= arrLen)) {
              errors.push(
                `Highlight index ${idx} out of bounds at step ${i} (snapshot length: ${arrLen}).`
              );
            }
          }
        }

        for (const pointer of step.pointers ?? []) {
          if (typeof pointer.index === "number" && (pointer.index < 0 || pointer.index >= arrLen)) {
            errors.push(
              `Pointer "${pointer.name}" index ${pointer.index} out of bounds at step ${i} (snapshot length: ${arrLen}).`
            );
          }
        }
      }

      // 4. Monotonic metrics progression
      if (step.metrics.comparisons < prevComparisons) {
        errors.push(`Comparisons metric decreased at step ${i}.`);
      }
      if (step.metrics.swaps < prevSwaps) {
        errors.push(`Swaps metric decreased at step ${i}.`);
      }

      prevComparisons = step.metrics.comparisons;
      prevSwaps = step.metrics.swaps;

      // 5. Legal transition check: no active actions after complete
      if (hasCompleted) {
        errors.push(`Illegal transition: step ${i} occurs after a "complete" step.`);
      }
      if (normalizedAction === "complete") {
        hasCompleted = true;
      }
    }

    // 6. Final state agreement with output for array sorting
    if (trace.category === "sorting" && Array.isArray(trace.output)) {
      const finalStep = trace.steps[trace.steps.length - 1]!;
      if (Array.isArray(finalStep.stateSnapshot)) {
        const matchesOutput =
          finalStep.stateSnapshot.length === trace.output.length &&
          finalStep.stateSnapshot.every((val, idx) => val === (trace.output as unknown[])[idx]);

        if (!matchesOutput) {
          errors.push("Final step state snapshot does not match algorithm output.");
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

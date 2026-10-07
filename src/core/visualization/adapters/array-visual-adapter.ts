import type { ExecutionStep } from "../../../contracts/events/trace-events";
import type {
  ArrayElementVisual,
  ArrayVisualState,
} from "../../../contracts/events/visualization-state";
import { ArrayVisualModel } from "../models/array-visual-model";

export class ArrayVisualAdapter {
  /**
   * Transforms an array execution step into a normalized ArrayVisualState for rendering.
   */
  public static adaptStep(
    step: ExecutionStep<number[]>,
    originalInput?: readonly number[]
  ): ArrayVisualState {
    const rawArray = Array.isArray(step.stateSnapshot) ? step.stateSnapshot : [];

    // Map original index where possible
    const elements: ArrayElementVisual[] = rawArray.map((value, currentIndex) => {
      const origIndex = originalInput ? originalInput.indexOf(value) : currentIndex;
      const originalIndex = origIndex !== -1 ? origIndex : currentIndex;

      return {
        id: ArrayVisualModel.getElementId(originalIndex, value),
        value,
        originalIndex,
        currentIndex,
        state: ArrayVisualModel.deriveElementState(currentIndex, step),
      };
    });

    const pointers: Record<string, number> = {};
    for (const pointer of step.pointers) {
      if (typeof pointer.index === "number") {
        pointers[pointer.name] = pointer.index;
      }
    }

    return {
      type: "array",
      elements,
      pointers,
    };
  }
}

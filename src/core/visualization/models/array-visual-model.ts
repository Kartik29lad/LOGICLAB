import type { ExecutionStep } from "../../../contracts/events/trace-events";
import type { ArrayElementVisualState } from "../contracts/visualization.types";

export class ArrayVisualModel {
  /**
   * Derives element visual state from current step action and highlight definitions.
   */
  public static deriveElementState(
    index: number,
    step: ExecutionStep<number[]>
  ): ArrayElementVisualState {
    for (const highlight of step.highlights) {
      if (highlight.indices.includes(index)) {
        switch (highlight.colorRole) {
          case "comparison":
            return "comparing";
          case "secondary":
            return step.action === "swap" ? "swapping" : "selected";
          case "sorted":
            return "sorted";
          case "active":
            return "selected";
          case "danger":
            return "pivot";
        }
      }
    }

    if (step.action === "mark-sorted") {
      const isMarked = step.highlights.some(
        (h) => h.colorRole === "sorted" && h.indices.includes(index)
      );
      if (isMarked) return "sorted";
    }

    if (step.action === "complete") {
      return "sorted";
    }

    return "default";
  }

  /**
   * Generates a unique, stable element identifier preserving visual identity across animations.
   */
  public static getElementId(originalIndex: number, value: number): string {
    return `arr-elem-${originalIndex}-${value}`;
  }
}

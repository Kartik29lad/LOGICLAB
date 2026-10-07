import type {
  AlgorithmTrace,
  ExecutionStep,
  StepHighlight,
} from "../../../contracts/events/trace-events";
import { ArrayVisualAdapter } from "../adapters/array-visual-adapter";
import type {
  ArrayVisualState,
  GraphVisualState,
  NormalizedVisualFrame,
  VisualizationStatus,
} from "../contracts/visualization.types";

export class VisualizationTransformer {
  /**
   * Transforms an individual execution step into an immutable normalized visual frame.
   * Isolates UI renderers from raw algorithm execution traces.
   */
  public static transformStep(
    step: ExecutionStep,
    totalSteps: number,
    originalInput?: unknown
  ): NormalizedVisualFrame {
    const isCompleted = step.action === "complete" || step.stepIndex === totalSteps - 1;
    const status: VisualizationStatus = isCompleted ? "completed" : "running";

    let arrayState: ArrayVisualState | undefined;
    let graphState: GraphVisualState | undefined;

    if (Array.isArray(step.stateSnapshot)) {
      arrayState = ArrayVisualAdapter.adaptStep(
        step as ExecutionStep<number[]>,
        Array.isArray(originalInput) ? (originalInput as number[]) : undefined
      );
    } else if (
      step.stateSnapshot &&
      typeof step.stateSnapshot === "object" &&
      (step.stateSnapshot as { type?: string }).type === "graph"
    ) {
      graphState = step.stateSnapshot as GraphVisualState;
    }

    const snapshot =
      arrayState ??
      graphState ??
      ({
        type: "array",
        elements: [],
        pointers: {},
      } as const);

    const activePointers: Record<string, number | string> = {};
    let currentNode: string | null = null;

    for (const pointer of step.pointers ?? []) {
      activePointers[pointer.name] = pointer.index;
      if (pointer.name === "current" || pointer.name === "currentNode") {
        currentNode = String(pointer.index);
      }
    }

    const highlights: StepHighlight[] = (step.highlights ?? []).map((h) => ({
      indices: [...h.indices],
      colorRole: h.colorRole,
    }));

    const activeElements = Array.from(new Set(highlights.flatMap((h) => h.indices)));

    return {
      stepIndex: step.stepIndex,
      totalSteps,
      description: step.description,
      action: step.action,
      snapshot,
      activeElements,
      highlightedElements: highlights,
      visitedNodes: [],
      currentNode,
      queueState: [],
      stackState: [],
      arrayState,
      graphState,
      metrics: { ...step.metrics },
      status,
      activePointers,
      isCompleted,
    };
  }

  /**
   * Transforms an entire algorithm trace into an array of immutable visual frames.
   */
  public static transformTrace(trace: AlgorithmTrace): NormalizedVisualFrame[] {
    return trace.steps.map((step) => this.transformStep(step, trace.totalSteps, trace.input));
  }
}

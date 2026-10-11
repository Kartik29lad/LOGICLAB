export const VISUALIZER_RESOURCE_LIMITS = {
  arrayValues: 100,
  graphNodes: 30,
  graphEdges: 60,
  treeValues: 30,
  linearValues: 100,
  traceSteps: 5000,
  timelineMarkers: 180,
} as const;

export interface ResourceLimitResult {
  valid: boolean;
  message?: string;
}

export function validateTraceBudget(stepCount: number): ResourceLimitResult {
  return stepCount <= VISUALIZER_RESOURCE_LIMITS.traceSteps
    ? { valid: true }
    : {
        valid: false,
        message: `This execution produced ${stepCount.toLocaleString()} steps, exceeding the visualizer limit of ${VISUALIZER_RESOURCE_LIMITS.traceSteps.toLocaleString()}. Reduce the input size and run again.`,
      };
}

export function validateCollectionSize(
  kind: "array" | "graphNodes" | "graphEdges" | "tree" | "linear",
  size: number
): ResourceLimitResult {
  const limit =
    kind === "array"
      ? VISUALIZER_RESOURCE_LIMITS.arrayValues
      : kind === "graphNodes"
        ? VISUALIZER_RESOURCE_LIMITS.graphNodes
        : kind === "graphEdges"
          ? VISUALIZER_RESOURCE_LIMITS.graphEdges
          : kind === "tree"
            ? VISUALIZER_RESOURCE_LIMITS.treeValues
            : VISUALIZER_RESOURCE_LIMITS.linearValues;
  return size <= limit
    ? { valid: true }
    : { valid: false, message: `${kind} input is limited to ${limit} items.` };
}

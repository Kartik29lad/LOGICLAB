import type { ExecutionTraceStep } from "@/contracts/events/trace-events";

import { VISUALIZER_RESOURCE_LIMITS } from "./resource-limits";

export interface TraceWindow {
  start: number;
  end: number;
  steps: ExecutionTraceStep[];
  grouped: boolean;
}

export function getTraceWindow(
  steps: readonly ExecutionTraceStep[],
  currentStep: number,
  radius = 70
): TraceWindow {
  if (steps.length <= VISUALIZER_RESOURCE_LIMITS.timelineMarkers) {
    return { start: 0, end: steps.length, steps: [...steps], grouped: false };
  }
  const safeRadius = Math.max(
    10,
    Math.min(radius, Math.floor(VISUALIZER_RESOURCE_LIMITS.timelineMarkers / 2))
  );
  const start = Math.max(0, Math.min(currentStep - safeRadius, steps.length - safeRadius * 2));
  const end = Math.min(steps.length, start + safeRadius * 2);
  return { start, end, steps: steps.slice(start, end), grouped: true };
}

export function shouldVirtualizeTrace(stepCount: number): boolean {
  return stepCount > VISUALIZER_RESOURCE_LIMITS.timelineMarkers;
}

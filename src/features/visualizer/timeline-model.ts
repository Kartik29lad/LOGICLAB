import type { ExecutionTraceStep } from "@/contracts/events/trace-events";

export const TIMELINE_EVENT_TYPES = [
  "COMPARE",
  "SWAP",
  "WRITE",
  "VISIT",
  "RELAX",
  "FOUND",
  "NOT_FOUND",
  "INSERT",
  "REMOVE",
  "PUSH",
  "POP",
  "ENQUEUE",
  "DEQUEUE",
  "ROTATE",
  "PIVOT",
  "PARTITION",
  "MERGE",
  "MARK_SORTED",
  "COMPLETE",
] as const;

export type TimelineEventType = (typeof TIMELINE_EVENT_TYPES)[number];

export interface TimelineBucket {
  key: string;
  startStep: number;
  endStep: number;
  representativeStep: number;
  eventTypes: string[];
  dominantEvent?: string;
  containsCurrent: boolean;
}

export interface TimelineModel {
  buckets: TimelineBucket[];
  bucketSize: number;
  isDense: boolean;
}

const DENSE_THRESHOLD = 120;
const MAX_MARKERS = 120;

export function buildTimelineModel(
  steps: readonly ExecutionTraceStep[],
  currentStep: number
): TimelineModel {
  if (steps.length <= MAX_MARKERS) {
    return {
      buckets: steps.map((step) => ({
        key: `step-${step.stepIndex}`,
        startStep: step.stepIndex,
        endStep: step.stepIndex,
        representativeStep: step.stepIndex,
        eventTypes: [step.event.type],
        dominantEvent: isMarkedEvent(step.event.type) ? step.event.type : undefined,
        containsCurrent: step.stepIndex === currentStep,
      })),
      bucketSize: 1,
      isDense: false,
    };
  }

  const bucketSize = Math.ceil(steps.length / MAX_MARKERS);
  const buckets: TimelineBucket[] = [];
  for (let start = 0; start < steps.length; start += bucketSize) {
    const end = Math.min(steps.length - 1, start + bucketSize - 1);
    const bucketSteps = steps.slice(start, end + 1);
    const counts = new Map<string, number>();
    for (const step of bucketSteps)
      counts.set(step.event.type, (counts.get(step.event.type) ?? 0) + 1);
    const eventTypes = [...counts.keys()];
    const dominantEvent = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    buckets.push({
      key: `bucket-${start}-${end}`,
      startStep: start,
      endStep: end,
      representativeStep: start,
      eventTypes,
      dominantEvent: isMarkedEvent(dominantEvent) ? dominantEvent : undefined,
      containsCurrent: currentStep >= start && currentStep <= end,
    });
  }

  return { buckets, bucketSize, isDense: steps.length > DENSE_THRESHOLD };
}

export function isMarkedEvent(type: string | undefined): type is TimelineEventType {
  return Boolean(type && TIMELINE_EVENT_TYPES.includes(type as TimelineEventType));
}

export function timelineProgress(currentStep: number, totalSteps: number): number {
  if (totalSteps <= 1) return totalSteps === 1 ? 1 : 0;
  return Math.max(0, Math.min(1, currentStep / (totalSteps - 1)));
}

import type { TraceMetricSnapshot } from "@/contracts/events/trace-events";

export interface MetricDefinition {
  key: keyof TraceMetricSnapshot;
  label: string;
  description: string;
  unit?: string;
}

export const VISUALIZER_METRICS: readonly MetricDefinition[] = [
  {
    key: "comparisons",
    label: "Comparisons",
    description: "Times the algorithm compared values or candidates.",
  },
  {
    key: "swaps",
    label: "Swaps",
    description: "Times two positions or entities exchanged places.",
  },
  { key: "reads", label: "Reads", description: "Times the algorithm read an element or value." },
  { key: "writes", label: "Writes", description: "Times the algorithm wrote or replaced a value." },
  {
    key: "visits",
    label: "Visits",
    description: "Times the algorithm visited a graph or tree entity.",
  },
  { key: "iterations", label: "Events", description: "Number of execution events emitted so far." },
  {
    key: "elapsedMs",
    label: "Elapsed",
    description: "Recorded execution time for the trace.",
    unit: "ms",
  },
];

export function metricDelta(
  previous: TraceMetricSnapshot | undefined,
  current: TraceMetricSnapshot
): TraceMetricSnapshot {
  const base = previous ?? zeroMetrics();
  return {
    comparisons: Math.max(0, current.comparisons - base.comparisons),
    swaps: Math.max(0, current.swaps - base.swaps),
    reads: Math.max(0, current.reads - base.reads),
    writes: Math.max(0, current.writes - base.writes),
    visits: Math.max(0, current.visits - base.visits),
    iterations: Math.max(0, current.iterations - base.iterations),
    elapsedMs: Math.max(0, current.elapsedMs - base.elapsedMs),
  };
}

export function metricProgress(current: TraceMetricSnapshot, total: TraceMetricSnapshot): number {
  const currentWork = Math.max(0, current.iterations);
  const totalWork = Math.max(0, total.iterations);
  if (totalWork === 0) return 0;
  return Math.min(1, currentWork / totalWork);
}

export function metricFocus(
  eventType: string | undefined,
  delta: TraceMetricSnapshot
): keyof TraceMetricSnapshot | undefined {
  const preferred: Partial<Record<string, keyof TraceMetricSnapshot>> = {
    COMPARE: "comparisons",
    SWAP: "swaps",
    READ: "reads",
    WRITE: "writes",
    VISIT: "visits",
  };
  const mapped = eventType ? preferred[eventType] : undefined;
  if (mapped && delta[mapped] > 0) return mapped;
  return undefined;
}

export function zeroMetrics(): TraceMetricSnapshot {
  return { comparisons: 0, swaps: 0, reads: 0, writes: 0, visits: 0, iterations: 0, elapsedMs: 0 };
}

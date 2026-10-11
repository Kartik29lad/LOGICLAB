import type {
  ExecutionEventType,
  TraceMetricSnapshot,
} from "../../../contracts/events/trace-events";

export function metricDeltasFromEvents(
  events: readonly { type: ExecutionEventType }[]
): Partial<TraceMetricSnapshot> {
  const result: Partial<TraceMetricSnapshot> = {};
  for (const event of events) {
    if (event.type === "COMPARE") result.comparisons = (result.comparisons ?? 0) + 1;
    if (event.type === "SWAP") result.swaps = (result.swaps ?? 0) + 1;
    if (event.type === "READ") result.reads = (result.reads ?? 0) + 1;
    if (event.type === "WRITE") result.writes = (result.writes ?? 0) + 1;
    if (event.type === "VISIT") result.visits = (result.visits ?? 0) + 1;
    result.iterations = (result.iterations ?? 0) + 1;
  }
  return result;
}

export function validateMetricsAgainstEvents(
  events: readonly { type: ExecutionEventType }[],
  metrics: TraceMetricSnapshot
): void {
  const expected = metricDeltasFromEvents(events);
  const checks: Array<keyof TraceMetricSnapshot> = [
    "comparisons",
    "swaps",
    "reads",
    "writes",
    "visits",
  ];
  for (const key of checks) {
    const expectedValue = expected[key] ?? 0;
    if (metrics[key] !== expectedValue) {
      throw new Error(
        `Metric ${key} (${metrics[key]}) does not match event count (${expectedValue}).`
      );
    }
  }
}

import type { ExecutionMetricName, ExecutionMetrics } from "../../contracts/execution";

export class ExecutionMetricsCollector {
  private readonly startedAt = Date.now();
  private metrics: {
    comparisons: number;
    swaps: number;
    reads: number;
    writes: number;
    visits: number;
    iterations: number;
  } = {
    comparisons: 0,
    swaps: 0,
    reads: 0,
    writes: 0,
    visits: 0,
    iterations: 0,
  };

  public increment(metric: ExecutionMetricName, amount = 1): void {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new RangeError("Metric increment must be a finite, non-negative number.");
    }
    this.metrics[metric] += amount;
  }

  public snapshot(): ExecutionMetrics {
    return { ...this.metrics, elapsedMs: Date.now() - this.startedAt };
  }
}

export interface AlgorithmMetrics {
  stepCount: number;
  comparisonsCount: number;
  swapsCount: number;
  arrayAccessesCount: number;
  peakMemoryBytes?: number;
  executionDurationMs: number;
}

export class ExecutionMetricsCollector {
  private startTime = 0;
  private comparisons = 0;
  private swaps = 0;
  private accesses = 0;
  private steps = 0;

  public start(): void {
    this.startTime = performance.now();
    this.comparisons = 0;
    this.swaps = 0;
    this.accesses = 0;
    this.steps = 0;
  }

  public recordComparison(): void {
    this.comparisons++;
  }

  public recordSwap(): void {
    this.swaps++;
  }

  public recordAccess(count = 1): void {
    this.accesses += count;
  }

  public recordStep(): void {
    this.steps++;
  }

  public finish(): AlgorithmMetrics {
    const executionDurationMs = Math.round((performance.now() - this.startTime) * 100) / 100;
    return {
      stepCount: this.steps,
      comparisonsCount: this.comparisons,
      swapsCount: this.swaps,
      arrayAccessesCount: this.accesses,
      executionDurationMs,
    };
  }
}

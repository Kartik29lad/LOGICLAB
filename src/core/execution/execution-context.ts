import { DEFAULT_EXECUTION_LIMITS, type ExecutionLimits } from "./execution-limits";

export class CancellationToken {
  private cancelled = false;

  public cancel(): void {
    this.cancelled = true;
  }

  public isCancellationRequested(): boolean {
    return this.cancelled;
  }

  public reset(): void {
    this.cancelled = false;
  }
}

/**
 * Execution context tracking budget thresholds and runtime cancellation.
 */
export class ExecutionContext {
  public readonly cancellationToken: CancellationToken;
  public readonly limits: ExecutionLimits;
  private stepCount = 0;
  private startTime: number;

  constructor(options?: {
    limits?: Partial<ExecutionLimits>;
    cancellationToken?: CancellationToken;
  }) {
    this.limits = { ...DEFAULT_EXECUTION_LIMITS, ...options?.limits };
    this.cancellationToken = options?.cancellationToken ?? new CancellationToken();
    this.startTime = performance.now();
  }

  public reset(): void {
    this.stepCount = 0;
    this.startTime = performance.now();
    this.cancellationToken.reset();
  }

  public recordStep(): void {
    this.stepCount++;
    this.checkBudget();
  }

  public getStepCount(): number {
    return this.stepCount;
  }

  public getElapsedMs(): number {
    return performance.now() - this.startTime;
  }

  /**
   * Throws an error if the execution has been cancelled or has exceeded step or timeout limits.
   */
  public checkBudget(): void {
    if (this.cancellationToken.isCancellationRequested()) {
      throw new Error("Execution was cancelled by the user.");
    }

    if (this.stepCount > this.limits.maxSteps) {
      throw new Error(
        `Execution limit exceeded: generated ${this.stepCount} steps (limit: ${this.limits.maxSteps}).`
      );
    }

    if (this.getElapsedMs() > this.limits.maxRuntimeMs) {
      throw new Error(
        `Execution timeout exceeded: runtime exceeded ${this.limits.maxRuntimeMs}ms.`
      );
    }
  }
}

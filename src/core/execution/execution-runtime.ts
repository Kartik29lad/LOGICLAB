import type {
  ExecutionCancellation,
  ExecutionLifecycleStatus,
  ExecutionLimits,
} from "../../contracts/execution";
import {
  ExecutionBudgetExceededError,
  ExecutionCancelledError,
  ExecutionStateError,
} from "./execution-errors";

const TERMINAL = new Set<ExecutionLifecycleStatus>(["completed", "failed", "cancelled"]);

export class ExecutionRuntime implements ExecutionCancellation {
  private status: ExecutionLifecycleStatus = "created";
  private abortedFlag = false;
  private abortReason?: string;
  private stepCount = 0;
  private traceEventCount = 0;
  private resumeWaiter: (() => void) | undefined;
  private stepPermit = false;
  private readonly startedAt = Date.now();

  public constructor(public readonly limits: ExecutionLimits) {}

  public get aborted(): boolean {
    return this.abortedFlag;
  }

  public get reason(): string | undefined {
    return this.abortReason;
  }

  public get currentStatus(): ExecutionLifecycleStatus {
    return this.status;
  }

  public transition(next: ExecutionLifecycleStatus): void {
    if (TERMINAL.has(this.status))
      throw new ExecutionStateError(`Cannot transition from terminal state ${this.status}.`);
    const allowed: Record<ExecutionLifecycleStatus, ExecutionLifecycleStatus[]> = {
      created: ["validated", "failed", "cancelled"],
      validated: ["initialized", "failed", "cancelled"],
      initialized: ["running", "failed", "cancelled"],
      running: ["paused", "completed", "failed", "cancelled"],
      paused: ["running", "completed", "cancelled", "failed"],
      completed: [],
      failed: [],
      cancelled: [],
    };
    if (!allowed[this.status].includes(next)) {
      throw new ExecutionStateError(`Invalid execution transition: ${this.status} → ${next}.`);
    }
    this.status = next;
  }

  public pause(): void {
    if (this.status !== "running")
      throw new ExecutionStateError("Execution can only be paused while running.");
    this.status = "paused";
  }

  public resume(): void {
    if (this.status !== "paused")
      throw new ExecutionStateError("Execution can only be resumed while paused.");
    this.status = "running";
    this.releaseWaiter();
  }

  public stepForward(): void {
    if (this.status !== "paused")
      throw new ExecutionStateError("Step forward requires a paused execution.");
    this.stepPermit = true;
    this.releaseWaiter();
  }

  public cancel(reason = "Execution cancelled by caller."): void {
    if (TERMINAL.has(this.status)) return;
    this.abortedFlag = true;
    this.abortReason = reason;
    this.status = "cancelled";
    this.releaseWaiter();
  }

  public throwIfAborted(): void {
    if (this.abortedFlag) throw new ExecutionCancelledError(this.abortReason);
    this.checkRuntime();
  }

  public async checkpoint(): Promise<void> {
    this.throwIfAborted();
    this.stepCount += 1;
    if (this.stepCount > this.limits.maxSteps) {
      throw new ExecutionBudgetExceededError(
        `Execution exceeded maxSteps (${this.limits.maxSteps}).`
      );
    }
    if (this.status === "paused") await this.waitForResume();
    this.throwIfAborted();
  }

  public registerEvent(): void {
    this.throwIfAborted();
    this.traceEventCount += 1;
    if (
      this.limits.maxTraceEvents !== undefined &&
      this.traceEventCount > this.limits.maxTraceEvents
    ) {
      throw new ExecutionBudgetExceededError(
        `Execution exceeded maxTraceEvents (${this.limits.maxTraceEvents}).`
      );
    }
  }

  public finish(
    status: Extract<ExecutionLifecycleStatus, "completed" | "failed" | "cancelled">
  ): void {
    if (this.status === status) return;
    if (status === "cancelled") {
      this.cancel(this.abortReason ?? "Execution cancelled.");
      return;
    }
    this.transition(status);
  }

  public elapsedMs(): number {
    return Date.now() - this.startedAt;
  }

  private checkRuntime(): void {
    if (this.elapsedMs() > this.limits.maxRuntimeMs) {
      throw new ExecutionBudgetExceededError(
        `Execution exceeded maxRuntimeMs (${this.limits.maxRuntimeMs}).`
      );
    }
  }

  private async waitForResume(): Promise<void> {
    if (this.status !== "paused") return;
    await new Promise<void>((resolve) => {
      this.resumeWaiter = resolve;
    });
    if (this.stepPermit) {
      this.stepPermit = false;
      this.status = "paused";
    }
  }

  private releaseWaiter(): void {
    const waiter = this.resumeWaiter;
    this.resumeWaiter = undefined;
    waiter?.();
  }
}

import type { AlgorithmTrace, ExecutionStep } from "../../contracts/events/trace-events";
import { isValidExecutionTransition, type ExecutionStatus } from "./execution-state";

/**
 * Execution Controller managing step-by-step playback state and navigation.
 */
export class ExecutionController<TState = unknown> {
  private currentStepIndex = 0;
  private status: ExecutionStatus = "CREATED";

  constructor(public readonly trace: AlgorithmTrace<unknown, unknown, TState>) {
    this.transitionTo("INITIALIZED");
  }

  public getStatus(): ExecutionStatus {
    return this.status;
  }

  public getCurrentIndex(): number {
    return this.currentStepIndex;
  }

  public getCurrentStep(): ExecutionStep<TState> | undefined {
    return this.trace.steps[this.currentStepIndex];
  }

  public getTotalSteps(): number {
    return this.trace.steps.length;
  }

  public start(): void {
    if (this.status === "INITIALIZED" || this.status === "PAUSED") {
      this.transitionTo("RUNNING");
    }
  }

  public pause(): void {
    if (this.status === "RUNNING") {
      this.transitionTo("PAUSED");
    }
  }

  public resume(): void {
    this.start();
  }

  public stepForward(): boolean {
    if (this.currentStepIndex < this.trace.steps.length - 1) {
      this.currentStepIndex++;
      if (this.currentStepIndex === this.trace.steps.length - 1) {
        this.transitionTo("COMPLETED");
      }
      return true;
    }
    this.transitionTo("COMPLETED");
    return false;
  }

  public stepBackward(): boolean {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      if (this.status === "COMPLETED") {
        this.transitionTo("PAUSED");
      }
      return true;
    }
    return false;
  }

  public seekTo(targetIndex: number): void {
    const clamped = Math.max(0, Math.min(targetIndex, this.trace.steps.length - 1));
    this.currentStepIndex = clamped;
    if (clamped === this.trace.steps.length - 1) {
      this.transitionTo("COMPLETED");
    } else if (this.status === "COMPLETED") {
      this.transitionTo("PAUSED");
    }
  }

  public reset(): void {
    this.currentStepIndex = 0;
    this.transitionTo("INITIALIZED");
  }

  public cancel(): void {
    this.transitionTo("CANCELLED");
  }

  private transitionTo(newStatus: ExecutionStatus): void {
    if (this.status === newStatus) return;
    if (isValidExecutionTransition(this.status, newStatus)) {
      this.status = newStatus;
    } else {
      // Force status transition if resetting from terminal states
      this.status = newStatus;
    }
  }
}

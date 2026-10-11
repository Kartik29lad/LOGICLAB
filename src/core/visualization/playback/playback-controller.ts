import type { CanonicalExecutionTrace } from "../../../contracts/events/trace-events";

export type PlaybackStatus = "IDLE" | "READY" | "PLAYING" | "ANIMATING" | "PAUSED" | "COMPLETED";
export const PLAYBACK_SPEEDS = [0.25, 0.5, 1, 1.5, 2, 4] as const;

export interface PlaybackSnapshot {
  status: PlaybackStatus;
  currentStep: number;
  speed: number;
  totalSteps: number;
  progress: number;
}

export interface PlaybackControllerOptions<TState> {
  trace: CanonicalExecutionTrace<unknown, unknown, TState>;
  onStep: (stepIndex: number) => void | Promise<void>;
  onStatus?: (status: PlaybackStatus) => void;
  /** Base delay between completed visual transitions. */
  stepDurationMs?: number;
  /** Called when an automatic transition is cancelled by pause/seek/restart/dispose. */
  onAnimationCancel?: () => void;
}

/**
 * Deterministic playback state machine. Execution state remains owned by the
 * canonical trace; this controller only owns navigation, timing, and lifecycle.
 */
export class PlaybackController<TState> {
  private readonly trace: CanonicalExecutionTrace<unknown, unknown, TState>;
  private readonly onStep: (stepIndex: number) => void | Promise<void>;
  private readonly onStatus?: (status: PlaybackStatus) => void;
  private readonly stepDurationMs: number;
  private readonly onAnimationCancel?: () => void;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private status: PlaybackStatus = "READY";
  private currentStep = 0;
  private speed = 1;
  private runToken = 0;

  public constructor(options: PlaybackControllerOptions<TState>) {
    this.trace = options.trace;
    this.onStep = options.onStep;
    this.onStatus = options.onStatus;
    this.stepDurationMs = Math.max(0, options.stepDurationMs ?? 700);
    this.onAnimationCancel = options.onAnimationCancel;
    this.emitStep();
  }

  public get snapshot(): PlaybackSnapshot {
    const last = Math.max(0, this.trace.steps.length - 1);
    return {
      status: this.status,
      currentStep: this.currentStep,
      speed: this.speed,
      totalSteps: this.trace.steps.length,
      progress: last === 0 ? 1 : this.currentStep / last,
    };
  }

  public play(): void {
    if (this.trace.steps.length <= 1) {
      this.status = "COMPLETED";
      this.notifyStatus();
      return;
    }

    if (this.currentStep >= this.trace.steps.length - 1) {
      this.restart();
    }

    this.invalidatePendingTransition();
    this.status = "PLAYING";
    this.notifyStatus();
    this.scheduleNext(this.runToken);
  }

  public pause(): void {
    if (this.status !== "PLAYING" && this.status !== "ANIMATING") return;
    this.invalidatePendingTransition();
    this.status = "PAUSED";
    this.notifyStatus();
  }

  public next(): void {
    this.invalidatePendingTransition();
    if (this.currentStep < this.trace.steps.length - 1) {
      this.currentStep += 1;
      this.emitStep();
    }
    this.status = this.currentStep >= this.trace.steps.length - 1 ? "COMPLETED" : "PAUSED";
    this.notifyStatus();
  }

  public previous(): void {
    this.invalidatePendingTransition();
    this.currentStep = Math.max(0, this.currentStep - 1);
    this.status = "PAUSED";
    this.emitStep();
    this.notifyStatus();
  }

  public restart(): void {
    this.invalidatePendingTransition();
    this.currentStep = 0;
    this.status = "READY";
    this.emitStep();
    this.notifyStatus();
  }

  public setStep(stepIndex: number): void {
    this.invalidatePendingTransition();
    this.currentStep = Math.max(0, Math.min(this.trace.steps.length - 1, Math.trunc(stepIndex)));
    this.status = this.currentStep === this.trace.steps.length - 1 ? "COMPLETED" : "PAUSED";
    this.emitStep();
    this.notifyStatus();
  }

  public setSpeed(speed: number): void {
    if (!PLAYBACK_SPEEDS.includes(speed as (typeof PLAYBACK_SPEEDS)[number])) {
      throw new RangeError(`Unsupported playback speed: ${speed}`);
    }
    this.speed = speed;
    if (this.status === "PLAYING") {
      this.invalidatePendingTransition();
      this.scheduleNext(this.runToken);
    }
  }

  public dispose(): void {
    this.invalidatePendingTransition();
    this.status = "IDLE";
  }

  private scheduleNext(token: number): void {
    this.clearTimer();
    if (this.status !== "PLAYING" || token !== this.runToken) return;
    if (this.currentStep >= this.trace.steps.length - 1) {
      this.status = "COMPLETED";
      this.notifyStatus();
      return;
    }

    this.timer = setTimeout(() => {
      this.timer = undefined;
      if (this.status !== "PLAYING" || token !== this.runToken) return;

      this.currentStep += 1;
      this.status = "ANIMATING";
      this.notifyStatus();

      let result: void | Promise<void>;
      try {
        result = this.onStep(this.currentStep);
      } catch {
        this.finishAnimation(token);
        throw new Error("Playback step failed while applying the visual state.");
      }

      Promise.resolve(result).then(
        () => this.finishAnimation(token),
        () => this.finishAnimation(token)
      );
    }, this.stepDurationMs / this.speed);
  }

  private finishAnimation(token: number): void {
    if (token !== this.runToken || this.status !== "ANIMATING") return;
    if (this.currentStep >= this.trace.steps.length - 1) {
      this.status = "COMPLETED";
      this.notifyStatus();
      return;
    }
    this.status = "PLAYING";
    this.notifyStatus();
    this.scheduleNext(token);
  }

  private emitStep(): void {
    void this.onStep(this.currentStep);
  }

  private notifyStatus(): void {
    this.onStatus?.(this.status);
  }

  private clearTimer(): void {
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  private invalidatePendingTransition(): void {
    this.runToken += 1;
    this.clearTimer();
    this.onAnimationCancel?.();
  }
}

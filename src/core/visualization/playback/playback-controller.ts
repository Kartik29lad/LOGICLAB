import type { CanonicalExecutionTrace } from "../../../contracts/events/trace-events";
import {
  PLAYBACK_SPEEDS,
  type PlaybackControllerOptions,
  type PlaybackPort,
  type PlaybackSnapshot,
  type PlaybackStatus,
  type StepTransitionMode,
} from "../../../contracts/visualization/playback-port";

export { PLAYBACK_SPEEDS };
export type { PlaybackControllerOptions, PlaybackPort, PlaybackSnapshot, PlaybackStatus };

/**
 * Deterministic playback state machine. Execution state remains owned by the
 * canonical trace; this controller only owns navigation, timing, and lifecycle.
 */
export class PlaybackController<TState> implements PlaybackPort {
  private readonly trace: CanonicalExecutionTrace<unknown, unknown, TState>;
  private readonly onStep: PlaybackControllerOptions<TState>["onStep"];
  private readonly onStatus?: (status: PlaybackStatus) => void;
  private readonly stepDurationMs: number;
  private readonly postStepDwellMs?: number;
  private readonly onAnimationCancel?: () => void;
  private readonly onAnimationPause?: () => void;
  private readonly onAnimationResume?: () => void;
  private readonly onSpeedChange?: (speed: number) => void;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private status: PlaybackStatus = "READY";
  private currentStep = 0;
  private speed = 1;
  private runToken = 0;
  private pausedDuringAnimation = false;
  private activeAnimationMode: "auto" | "manual" = "auto";
  private stepStartedAt = 0;

  public constructor(options: PlaybackControllerOptions<TState>) {
    this.trace = options.trace;
    this.onStep = options.onStep;
    this.onStatus = options.onStatus;
    this.stepDurationMs = Math.max(0, options.stepDurationMs ?? 700);
    this.postStepDwellMs =
      options.postStepDwellMs !== undefined ? Math.max(0, options.postStepDwellMs) : undefined;
    this.onAnimationCancel = options.onAnimationCancel;
    this.onAnimationPause = options.onAnimationPause;
    this.onAnimationResume = options.onAnimationResume;
    this.onSpeedChange = options.onSpeedChange;
    this.emitStep("settle");
  }

  public get snapshot(): PlaybackSnapshot {
    const last = Math.max(0, this.trace.steps.length - 1);
    return {
      status: this.status,
      currentStep: this.currentStep,
      speed: this.speed,
      totalSteps: this.trace.steps.length,
      progress: last === 0 ? 1 : this.currentStep / last,
      generation: this.runToken,
    };
  }

  public play(): void {
    if (this.trace.steps.length <= 1) {
      this.status = "COMPLETED";
      this.notifyStatus();
      return;
    }

    if (this.status === "PAUSED" && this.pausedDuringAnimation) {
      this.pausedDuringAnimation = false;
      this.status = "ANIMATING";
      this.notifyStatus();
      this.onAnimationResume?.();
      return;
    }

    if (this.currentStep >= this.trace.steps.length - 1) {
      this.restart();
    }

    if (this.status === "ANIMATING") {
      this.invalidatePendingTransition();
    } else {
      this.runToken += 1;
      this.clearTimer();
    }
    this.status = "PLAYING";
    this.notifyStatus();
    const initialDelay =
      this.postStepDwellMs !== undefined ? this.postStepDwellMs / this.speed : undefined;
    this.scheduleNext(this.runToken, initialDelay);
  }

  public resume(): void {
    if (this.status === "PAUSED") {
      this.play();
    }
  }

  public pause(): void {
    if (this.status !== "PLAYING" && this.status !== "ANIMATING") return;

    if (this.status === "ANIMATING" && this.onAnimationPause) {
      this.clearTimer();
      this.pausedDuringAnimation = true;
      this.status = "PAUSED";
      this.onAnimationPause();
      this.notifyStatus();
      return;
    }

    this.invalidatePendingTransition();
    this.status = "PAUSED";
    this.notifyStatus();
  }

  public next(): void {
    this.invalidatePendingTransition();
    const last = Math.max(0, this.trace.steps.length - 1);
    if (this.currentStep >= last) {
      this.status = "COMPLETED";
      this.notifyStatus();
      return;
    }

    this.currentStep += 1;
    const token = this.runToken;
    this.activeAnimationMode = "manual";
    const result = this.onStep(this.currentStep, {
      stepIndex: this.currentStep,
      mode: "animate",
      generation: token,
    });

    if (isPromiseLike(result)) {
      this.status = "ANIMATING";
      this.notifyStatus();
      result.then(
        () => this.finishManualAnimation(token),
        () => this.finishManualAnimation(token)
      );
      return;
    }

    this.status = this.currentStep >= last ? "COMPLETED" : "PAUSED";
    this.notifyStatus();
  }

  public previous(): void {
    this.invalidatePendingTransition();
    this.currentStep = Math.max(0, this.currentStep - 1);
    this.status = "PAUSED";
    this.emitStep("settle");
    this.notifyStatus();
  }

  public restart(): void {
    this.invalidatePendingTransition();
    this.currentStep = 0;
    this.status = "READY";
    this.emitStep("settle");
    this.notifyStatus();
  }

  public setStep(stepIndex: number): void {
    this.invalidatePendingTransition();
    this.currentStep = Math.max(0, Math.min(this.trace.steps.length - 1, Math.trunc(stepIndex)));
    this.status = this.currentStep === this.trace.steps.length - 1 ? "COMPLETED" : "PAUSED";
    this.emitStep("settle");
    this.notifyStatus();
  }

  public setSpeed(speed: number): void {
    if (!PLAYBACK_SPEEDS.includes(speed as (typeof PLAYBACK_SPEEDS)[number])) {
      throw new RangeError(`Unsupported playback speed: ${speed}`);
    }
    this.speed = speed;
    this.onSpeedChange?.(speed);
    if (this.status === "PLAYING") {
      this.invalidatePendingTransition();
      this.scheduleNext(this.runToken);
    }
  }

  public dispose(): void {
    this.invalidatePendingTransition();
    this.status = "IDLE";
  }

  private scheduleNext(token: number, overrideDelayMs?: number): void {
    this.clearTimer();
    if (this.status !== "PLAYING" || token !== this.runToken) return;
    if (this.currentStep >= this.trace.steps.length - 1) {
      this.status = "COMPLETED";
      this.notifyStatus();
      return;
    }

    const delayMs =
      overrideDelayMs !== undefined
        ? Math.max(0, overrideDelayMs)
        : this.stepDurationMs / this.speed;

    this.timer = setTimeout(() => {
      this.timer = undefined;
      if (this.status !== "PLAYING" || token !== this.runToken) return;

      this.currentStep += 1;
      this.activeAnimationMode = "auto";
      this.stepStartedAt = nowMs();
      this.status = "ANIMATING";
      this.notifyStatus();

      let result: void | Promise<void>;
      try {
        result = this.onStep(this.currentStep, {
          stepIndex: this.currentStep,
          mode: "animate",
          generation: token,
        });
      } catch {
        this.finishAnimation(token);
        throw new Error("Playback step failed while applying the visual state.");
      }

      Promise.resolve(result).then(
        () => this.finishAnimation(token),
        () => this.finishAnimation(token)
      );
    }, delayMs);
  }

  private finishAnimation(token: number): void {
    if (token !== this.runToken || this.status !== "ANIMATING") return;
    if (this.activeAnimationMode === "manual") {
      this.finishManualAnimation(token);
      return;
    }
    if (this.currentStep >= this.trace.steps.length - 1) {
      this.status = "COMPLETED";
      this.notifyStatus();
      return;
    }
    this.status = "PLAYING";
    this.notifyStatus();

    if (this.postStepDwellMs !== undefined) {
      const elapsed = Math.max(0, nowMs() - this.stepStartedAt);
      const targetInterval = this.stepDurationMs / this.speed;
      const minDwell = this.postStepDwellMs / this.speed;
      const remaining = Math.max(minDwell, targetInterval - elapsed);
      this.scheduleNext(token, remaining);
      return;
    }
    this.scheduleNext(token);
  }

  private finishManualAnimation(token: number): void {
    if (token !== this.runToken || this.status !== "ANIMATING") return;
    const last = Math.max(0, this.trace.steps.length - 1);
    this.status = this.currentStep >= last ? "COMPLETED" : "PAUSED";
    this.notifyStatus();
  }

  private emitStep(mode: StepTransitionMode): void {
    void this.onStep(this.currentStep, {
      stepIndex: this.currentStep,
      mode,
      generation: this.runToken,
    });
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
    this.pausedDuringAnimation = false;
    this.clearTimer();
    this.onAnimationCancel?.();
  }
}

function isPromiseLike(value: unknown): value is Promise<void> {
  return (
    typeof value === "object" &&
    value !== null &&
    "then" in value &&
    typeof (value as PromiseLike<unknown>).then === "function"
  );
}

function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

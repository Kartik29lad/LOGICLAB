import type { CanonicalExecutionTrace } from "../events/trace-events";

export type PlaybackStatus = "IDLE" | "READY" | "PLAYING" | "ANIMATING" | "PAUSED" | "COMPLETED";
export const PLAYBACK_SPEEDS = [0.25, 0.5, 1, 1.5, 2, 4] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

export type StepTransitionMode = "animate" | "settle";

export interface PlaybackStepRequest {
  readonly stepIndex: number;
  readonly mode: StepTransitionMode;
  readonly generation: number;
}

export interface PlaybackSnapshot {
  status: PlaybackStatus;
  currentStep: number;
  speed: number;
  totalSteps: number;
  progress: number;
  generation?: number;
}

export interface PlaybackControllerOptions<TState> {
  trace: CanonicalExecutionTrace<unknown, unknown, TState>;
  onStep: (stepIndex: number, context?: PlaybackStepRequest) => void | Promise<void>;
  onStatus?: (status: PlaybackStatus) => void;
  /** Target minimum interval between automatic step starts (1x speed). */
  stepDurationMs?: number;
  /** Optional comprehension dwell after a step finishes animating. */
  postStepDwellMs?: number;
  /** Called when an active or pending transition is invalidated by seek/restart/dispose. */
  onAnimationCancel?: () => void;
  /** Called when playback pauses mid-animation so active timelines pause instead of cancelling. */
  onAnimationPause?: () => void;
  /** Called when playback resumes from a paused animation. */
  onAnimationResume?: () => void;
  /** Called when playback speed changes so active timelines update timeScale immediately. */
  onSpeedChange?: (speed: number) => void;
}

export interface PlaybackPort {
  readonly snapshot: PlaybackSnapshot;
  play(): void;
  pause(): void;
  resume?(): void;
  next(): void;
  previous(): void;
  restart(): void;
  setStep(stepIndex: number): void;
  setSpeed(speed: number): void;
  dispose(): void;
}

export type PlaybackControllerFactory = <TState>(
  options: PlaybackControllerOptions<TState>
) => PlaybackPort;

import type { CanonicalExecutionEvent } from "../events/trace-events";
import type { SemanticVisualState, VisualStateSnapshot } from "../events/visualization-state";
import type { PlaybackControllerFactory, StepTransitionMode } from "./playback-port";

export type AnimationIntentType =
  | "COMPARE"
  | "SWAP"
  | "WRITE"
  | "SELECT"
  | "SORTED"
  | "PIVOT"
  | "BOUNDARY"
  | "ACTIVE_RANGE"
  | "VISIT"
  | "DISCOVER"
  | "TRAVERSE"
  | "RELAX"
  | "FOUND"
  | "NOT_FOUND"
  | "PATH"
  | "INSERT"
  | "DELETE"
  | "ROTATE";

export type MotionEasing = "ease-in" | "ease-out" | "ease-in-out" | "linear";
export type MotionExecution = "serial" | "parallel";

export interface MotionPoint {
  readonly x: number;
  readonly y: number;
}

export interface AnimationIntent {
  id: string;
  type: AnimationIntentType;
  targetIds: string[];
  sourceStates?: Record<string, SemanticVisualState>;
  targetStates?: Record<string, SemanticVisualState>;
  durationMs: number;
  easing: MotionEasing;
  execution: MotionExecution;
  interruptible: boolean;
  reducedMotion: "skip" | "settle";
  metadata?: Readonly<Record<string, unknown>>;
}

export interface TransitionOperation {
  id: string;
  targetId: string;
  property: "transform" | "opacity" | "scale" | "highlight" | "state";
  from?: string | number;
  to?: string | number;
  durationMs: number;
  easing: MotionEasing;
  intentId: string;
}

export interface TransitionPlan {
  intentId: string;
  execution: MotionExecution;
  operations: TransitionOperation[];
  durationMs: number;
  interruptible: boolean;
  reducedMotion: "skip" | "settle";
}

export type ChoreographyOperation =
  | { kind: "compare"; targetIds: string[]; label?: string }
  | { kind: "swap-arc"; firstId: string; secondId: string; arcHeight: number }
  | { kind: "write"; targetId: string; emphasis?: "pulse" | "replace" }
  | { kind: "pivot"; targetId: string }
  | { kind: "boundary"; targetIds: string[]; activeIds?: string[]; dimIds?: string[] }
  | { kind: "visit"; targetId: string }
  | { kind: "discover"; targetId: string }
  | {
      kind: "edge-traverse";
      edgeId: string;
      fromNodeId: string;
      toNodeId: string;
      backtrack?: boolean;
    }
  | { kind: "relax"; targetId: string; edgeId?: string }
  | { kind: "found"; targetId: string }
  | { kind: "not-found"; targetIds: string[] }
  | { kind: "sorted"; targetIds: string[] }
  | {
      kind: "tree-morph";
      moves: Array<{ nodeId: string; from: MotionPoint; to: MotionPoint }>;
      edges: Array<{ edgeId: string; parentId: string; childId: string }>;
      insertedIds: string[];
      removedIds: string[];
    }
  | {
      kind: "linear-shift";
      enteredIds: string[];
      exitedIds: string[];
      shiftedIds: string[];
      direction: "vertical" | "horizontal";
    }
  | { kind: "pointer-update"; targetId: string; edgeId?: string; detached?: boolean }
  | {
      kind: "hash-trace";
      keyLabel?: string;
      bucketId: string;
      entryId?: string;
      collisionIds?: string[];
    }
  | { kind: "settle"; targetIds: string[] };

export interface ChoreographyPlan {
  readonly id: string;
  readonly stepIndex: number;
  readonly generation: number;
  readonly mode: StepTransitionMode;
  readonly durationMs: number;
  readonly easing: MotionEasing;
  readonly operations: readonly ChoreographyOperation[];
}

export type MotionOutcome = "completed" | "cancelled" | "settled-after-error";

export interface MotionResult {
  readonly outcome: MotionOutcome;
  readonly reason?: string;
}

export interface MotionHandle {
  readonly promise: Promise<void>;
  readonly result?: Promise<MotionResult>;
  cancel(): void;
  pause?(): void;
  resume?(): void;
  setSpeed?(speed: number): void;
}

export interface MotionTimingTokens {
  readonly microMs: number;
  readonly fastMs: number;
  readonly compareMs: number;
  readonly swapMs: number;
  readonly traverseMs: number;
  readonly relaxMs: number;
  readonly structuralMs: number;
  readonly settleMs: number;
}

export const MOTION_TIMING_TOKENS: MotionTimingTokens = {
  microMs: 120,
  fastMs: 180,
  compareMs: 240,
  swapMs: 420,
  traverseMs: 320,
  relaxMs: 280,
  structuralMs: 480,
  settleMs: 200,
};

export interface VisualizerRuntimePorts {
  readonly createPlaybackController?: PlaybackControllerFactory;
  readonly resolveAnimationIntent?: (
    event: CanonicalExecutionEvent,
    visualState?: VisualStateSnapshot | null
  ) => AnimationIntent | null;
}

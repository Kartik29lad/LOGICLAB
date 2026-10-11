import type { SemanticVisualState } from "@/contracts/events/visualization-state";

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
  | "PATH"
  | "INSERT"
  | "DELETE"
  | "ROTATE";

export type MotionEasing = "ease-in" | "ease-out" | "ease-in-out" | "linear";
export type MotionExecution = "serial" | "parallel";

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

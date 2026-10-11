import type { CanonicalExecutionTrace } from "@/contracts/events/trace-events";
import type { VisualizationState } from "@/contracts/events/visualization-state";

export interface VisualizationPlaybackState {
  trace: CanonicalExecutionTrace<unknown, unknown, unknown> | null;
  step: number;
  status: "IDLE" | "READY" | "PLAYING" | "PAUSED" | "COMPLETED" | "ERROR";
  speed: number;
}

export interface VisualizationInputState {
  array: number[];
  searchTarget?: number;
  linear: number[];
  graph: unknown;
  tree: unknown;
}

export interface VisualizationInteractionState {
  predictionMode: boolean;
  focusMode: boolean;
  presentationMode: boolean;
  fullscreen: boolean;
}

export interface VisualizationSessionModel {
  playback: VisualizationPlaybackState;
  input: VisualizationInputState;
  interaction: VisualizationInteractionState;
  error: string | null;
}

export function deriveVisualizationSessionState(
  model: VisualizationSessionModel,
  visualization: VisualizationState["visualization"] | null
): VisualizationState | null {
  if (!visualization) return null;
  return {
    ...visualization,
    visualization,
    selectedAlgorithm: undefined,
    executionTraceStep: model.playback.step,
    input: model.input.array,
    result: model.playback.trace?.output,
    error: model.error ?? undefined,
  };
}

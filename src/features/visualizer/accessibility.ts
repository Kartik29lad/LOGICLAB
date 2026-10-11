import type { ExecutionEventType } from "@/contracts/events/trace-events";

export interface VisualizerAccessibilityState {
  role: "region";
  label: string;
  liveAnnouncement: string;
  keyboardHint: string;
}

export function describeExecutionStep(
  title: string,
  step: number,
  total: number,
  eventType: ExecutionEventType,
  description?: string
): VisualizerAccessibilityState {
  const safeTotal = Math.max(0, total);
  const safeStep = safeTotal === 0 ? 0 : Math.min(Math.max(step + 1, 1), safeTotal);
  const detail = description?.trim() || eventType.replaceAll("_", " ").toLowerCase();
  return {
    role: "region",
    label: `${title} algorithm visualization`,
    liveAnnouncement:
      safeTotal === 0
        ? "Visualization is ready."
        : `Step ${safeStep} of ${safeTotal}. ${eventType.replaceAll("_", " ")}. ${detail}`,
    keyboardHint:
      "Use Space to play or pause, Arrow Left and Arrow Right to move between steps, and R to restart.",
  };
}

export function getInteractiveStateLabel(label: string, state: string): string {
  return `${label}, state: ${state.replaceAll("_", " ")}`;
}

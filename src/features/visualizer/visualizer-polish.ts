import type { ExecutionEventType } from "@/contracts/events/trace-events";
import type { SemanticVisualState } from "@/contracts/events/visualization-state";

import { ALGORITHM_VISUAL_RULES } from "./algorithm-visual-rules";
import { VISUAL_LANGUAGE } from "./visual-language";

export interface VisualizerPolishProfile {
  density: "comfortable" | "focused";
  motionClass: "motion-settle" | "motion-rich";
  emphasisClass: "emphasis-standard" | "emphasis-focused";
}

export interface EducationalCue {
  title: string;
  message: string;
  state: SemanticVisualState;
}

const EDUCATIONAL_CUES: Partial<Record<ExecutionEventType, EducationalCue>> = {
  COMPARE: {
    title: "Compare",
    message: "The algorithm is deciding which candidate should win this comparison.",
    state: "comparing",
  },
  SWAP: {
    title: "Swap",
    message:
      "These values exchange positions; stable element identity keeps the movement understandable.",
    state: "swapping",
  },
  WRITE: {
    title: "Write",
    message: "A new value is committed to this destination in the current execution state.",
    state: "writing",
  },
  PIVOT: {
    title: "Pivot",
    message: "This value defines the active partition boundary for the current sorting decision.",
    state: "pivot",
  },
  VISIT: {
    title: "Visit",
    message: "The algorithm has now processed this element or node.",
    state: "visited",
  },
  RELAX: {
    title: "Relax",
    message: "The algorithm is checking whether this route produces a better known distance.",
    state: "active",
  },
  FOUND: {
    title: "Found",
    message: "The requested target has been confirmed by the canonical execution trace.",
    state: "success",
  },
  BACKTRACK: {
    title: "Backtrack",
    message: "The algorithm is returning through the active path to continue exploration.",
    state: "path",
  },
  MARK_SORTED: {
    title: "Sorted",
    message: "This region is now known to be in its final sorted position.",
    state: "sorted",
  },
};

export function getVisualizerPolishProfile(
  focusMode: boolean,
  reducedMotion: boolean
): VisualizerPolishProfile {
  return {
    density: focusMode ? "focused" : "comfortable",
    motionClass: reducedMotion ? "motion-settle" : "motion-rich",
    emphasisClass: focusMode ? "emphasis-focused" : "emphasis-standard",
  };
}

export function getEducationalCue(event?: ExecutionEventType): EducationalCue | undefined {
  return event ? EDUCATIONAL_CUES[event] : undefined;
}

export function validateVisualLanguageConsistency(): string[] {
  const errors: string[] = [];
  const states = Object.keys(VISUAL_LANGUAGE) as SemanticVisualState[];
  const validStateSet = new Set<string>(states);
  const referencedStates = new Set(ALGORITHM_VISUAL_RULES.map((rule) => rule.emphasis));
  for (const state of referencedStates) {
    if (!validStateSet.has(state))
      errors.push(`Algorithm visual rule references unknown semantic state: ${state}`);
  }
  for (const state of states) {
    const rule = VISUAL_LANGUAGE[state];
    if (!rule.label.trim() || !rule.description.trim())
      errors.push(`Semantic state ${state} is missing educational metadata.`);
    if (!Number.isFinite(rule.priority))
      errors.push(`Semantic state ${state} has an invalid priority.`);
  }
  return errors;
}

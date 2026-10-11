import type { VisualExplanation } from "./visual-explanation-engine";

export const EXPLANATION_PREVIEW_LENGTH = 180;

export interface ExplanationExpansionModel {
  preview: string;
  full: string;
  expandable: boolean;
}

export function createExplanationExpansion(
  text: string,
  limit = EXPLANATION_PREVIEW_LENGTH
): ExplanationExpansionModel {
  const normalized = text.trim();
  if (normalized.length <= limit)
    return { preview: normalized, full: normalized, expandable: false };

  const boundary = normalized.lastIndexOf(" ", limit);
  const end = boundary > Math.floor(limit * 0.6) ? boundary : limit;
  return {
    preview: `${normalized.slice(0, end).trimEnd()}…`,
    full: normalized,
    expandable: true,
  };
}

export function explanationSourceLabel(source: VisualExplanation["source"]): string {
  switch (source) {
    case "trace":
      return "Execution trace";
    case "content":
      return "Learning content";
    case "combined":
      return "Trace + learning content";
    default:
      return "Limited trace evidence";
  }
}

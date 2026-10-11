import type { TraceMetricSnapshot } from "@/contracts/events/trace-events";
import type { ContentPackage } from "@/content/schema/content-types";

export interface ComplexityEducation {
  headline: string;
  summary: string;
  time: { best: string; average: string; worst: string };
  space: string;
  why: string;
  facts: string[];
}

export function createComplexityEducation(
  content: ContentPackage,
  metrics?: TraceMetricSnapshot
): ComplexityEducation | null {
  const complexity = content.metadata.complexity;
  if (!complexity) return null;
  const facts = [
    complexity.stable === undefined
      ? null
      : complexity.stable
        ? "Stable: equal values preserve their relative order."
        : "Not guaranteed stable.",
    complexity.inPlace === undefined
      ? null
      : complexity.inPlace
        ? "In-place: the algorithm uses the input structure without requiring a separate result structure."
        : "Uses additional working space beyond the input structure.",
    metrics
      ? `Current execution: ${metrics.iterations} events, ${metrics.comparisons} comparisons, ${metrics.swaps} swaps.`
      : null,
  ].filter((value): value is string => Boolean(value));
  return {
    headline: `${content.metadata.title} complexity`,
    summary: `Complexity describes how the algorithm's work and extra memory scale as the input grows.`,
    time: {
      best: complexity.timeBest,
      average: complexity.timeAverage,
      worst: complexity.timeWorst,
    },
    space: complexity.space,
    why: complexityExplanation(
      content.metadata.title,
      complexity.timeAverage,
      content.metadata.mainIdea
    ),
    facts,
  };
}

function complexityExplanation(title: string, average: string, mainIdea?: string): string {
  const idea = mainIdea ? ` Its central idea is ${mainIdea.toLowerCase()}.` : "";
  return `${title} is described with average time ${average}. This is a growth description, not a promise that every individual step costs the same.${idea}`;
}

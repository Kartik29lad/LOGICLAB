import type { ExecutionEventType, ExecutionTraceStep } from "@/contracts/events/trace-events";
import type { ContentPackage } from "@/content/schema/content-types";

export interface VisualExplanation {
  short: string;
  what: string;
  state: string;
  rule: string;
  decision: string;
  result: string;
  why: string;
  next: string;
  source: "trace" | "content" | "combined" | "insufficient-data";
}

export function explainVisualStep(
  content: ContentPackage,
  step: ExecutionTraceStep,
  nextStep?: ExecutionTraceStep
): VisualExplanation {
  const payload = isRecord(step.event.payload) ? step.event.payload : {};
  const event = step.event.type;
  const state = describeState(step.stateBefore, step.stateAfter);
  const rule = resolveRule(content, event);
  const decision = resolveDecision(content, step, payload);
  const result = resolveResult(step, payload);
  const next = nextStep
    ? `Next, ${eventLabel(nextStep.event.type)}.`
    : "This is the final execution step.";
  const hasDecisionEvidence = decision !== fallbackDecision(event);
  const source: VisualExplanation["source"] =
    hasDecisionEvidence && rule
      ? "combined"
      : hasDecisionEvidence
        ? "trace"
        : rule
          ? "content"
          : "insufficient-data";
  const why =
    decision !== fallbackDecision(event)
      ? decision
      : rule
        ? `${rule} ${content.metadata.mainIdea ? `This follows the algorithm's main idea: ${content.metadata.mainIdea}` : ""}`.trim()
        : `The trace records ${eventLabel(event)}, but it does not expose enough information to justify the decision further.`;

  return {
    short: `${eventLabel(event)} — ${result}`,
    what: describeWhat(content, step, event),
    state,
    rule: rule ?? "No explicit rule is available for this step in the content metadata.",
    decision,
    result,
    why,
    next,
    source,
  };
}

function describeWhat(
  content: ContentPackage,
  step: ExecutionTraceStep,
  event: ExecutionEventType
): string {
  const traceText = step.event.explanation?.text ?? step.event.description;
  const contentText = content.metadata.stepExplanations?.find(
    (item) => item.event === event
  )?.explanation;
  return traceText ?? contentText ?? `The execution performs ${eventLabel(event)}.`;
}

function resolveRule(content: ContentPackage, event: ExecutionEventType): string | null {
  const formulas = content.metadata.formulas ?? [];
  if (formulas.length === 0) return null;
  const keywords: Record<string, string[]> = {
    COMPARE: ["compare", "if", "<", ">", "=="],
    SWAP: ["swap", "exchange", "out of order"],
    WRITE: ["write", "assign", "replace"],
    RELAX: ["relax", "distance", "path", "weight"],
    VISIT: ["visit", "visited", "explore"],
    SELECT: ["select", "smallest", "largest", "minimum", "maximum"],
    PIVOT: ["pivot", "partition"],
    ENQUEUE: ["queue", "enqueue"],
    DEQUEUE: ["queue", "dequeue"],
    PUSH: ["stack", "push"],
    POP: ["stack", "pop"],
    FOUND: ["found", "target", "match"],
    NOT_FOUND: ["not found", "target", "search"],
    MARK_SORTED: ["sorted", "sort"],
    PARTITION: ["partition", "pivot"],
  };
  const matches = formulas.filter((formula) =>
    (keywords[event] ?? [event.toLowerCase()]).some((keyword) =>
      formula.toLowerCase().includes(keyword.toLowerCase())
    )
  );
  return matches[0] ?? null;
}

function resolveDecision(
  content: ContentPackage,
  step: ExecutionTraceStep,
  payload: Record<string, unknown>
): string {
  const explicit = firstString(payload, [
    "decision",
    "reason",
    "condition",
    "explanation",
    "description",
  ]);
  if (explicit) return explicit;

  const event = step.event.type;
  const values = resolveComparedValues(step, payload);
  if (event === "COMPARE" && values) {
    const [left, right] = values;
    if (typeof left === "number" && typeof right === "number") {
      return left === right
        ? `${left} equals ${right}, so the comparison does not establish an ordering difference.`
        : left < right
          ? `${left} is less than ${right}, so the compared pair is already ascending.`
          : `${left} is greater than ${right}, so the comparison establishes that the left value is larger.`;
    }
    return `The trace compares ${String(left)} and ${String(right)}.`;
  }

  if (event === "RELAX") {
    const oldDistance = firstNumber(payload, ["oldDistance", "oldG", "oldF"]);
    const newDistance = firstNumber(payload, ["newDistance", "newG", "newF"]);
    if (oldDistance !== undefined && newDistance !== undefined) {
      return newDistance < oldDistance
        ? `${newDistance} improves on the previous value ${oldDistance}, so the route is accepted.`
        : `${newDistance} does not improve the previous value ${oldDistance}, so the existing route remains.`;
    }
  }

  if (event === "FOUND") return "The trace records the target condition as satisfied.";
  if (event === "NOT_FOUND")
    return "The trace records that no valid candidate satisfied the target condition.";
  if (event === "COMPLETE")
    return content.metadata.whyItWorks ?? "The execution reached its completion condition.";
  return fallbackDecision(event);
}

function resolveResult(step: ExecutionTraceStep, payload: Record<string, unknown>): string {
  const explicit = firstString(payload, ["result", "outcome", "resultText"]);
  if (explicit) return explicit;
  const before = stableString(step.stateBefore);
  const after = stableString(step.stateAfter);
  return before === after
    ? `The ${eventLabel(step.event.type)} event was recorded without a visible state change.`
    : `The state changed from ${summarize(step.stateBefore)} to ${summarize(step.stateAfter)}.`;
}

function describeState(before: unknown, after: unknown): string {
  return stableString(before) === stableString(after)
    ? `Before and after this step, the visible state is ${summarize(after)}.`
    : `The step starts with ${summarize(before)} and produces ${summarize(after)}.`;
}

function resolveComparedValues(
  step: ExecutionTraceStep,
  payload: Record<string, unknown>
): [unknown, unknown] | null {
  const directLeft = payload.leftValue ?? payload.valueLeft;
  const directRight = payload.rightValue ?? payload.valueRight;
  if (directLeft !== undefined && directRight !== undefined) return [directLeft, directRight];
  const leftIndex = firstNumber(payload, ["i", "left", "from", "current"]);
  const rightIndex = firstNumber(payload, ["j", "right", "to", "target"]);
  if (leftIndex === undefined || rightIndex === undefined) return null;
  if (
    Array.isArray(step.stateBefore) &&
    step.stateBefore[leftIndex] !== undefined &&
    step.stateBefore[rightIndex] !== undefined
  ) {
    return [step.stateBefore[leftIndex], step.stateBefore[rightIndex]];
  }
  return null;
}

function fallbackDecision(event: ExecutionEventType): string {
  return `The trace records ${eventLabel(event)} as the current execution decision.`;
}

function eventLabel(event: string): string {
  return event
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (character) => character.toUpperCase());
}

function firstString(value: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys)
    if (typeof value[key] === "string" && value[key].trim()) return value[key].trim();
  return null;
}

function firstNumber(value: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys)
    if (typeof value[key] === "number" && Number.isFinite(value[key])) return value[key];
  return undefined;
}

function summarize(value: unknown): string {
  if (Array.isArray(value))
    return `[${value.slice(0, 8).map(String).join(", ")}${value.length > 8 ? ", …" : ""}]`;
  if (isRecord(value)) {
    const entries = Object.entries(value)
      .slice(0, 4)
      .map(([key, item]) => `${key}=${summarize(item)}`);
    return `{${entries.join(", ")}${Object.keys(value).length > 4 ? ", …" : ""}}`;
  }
  return String(value);
}

function stableString(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

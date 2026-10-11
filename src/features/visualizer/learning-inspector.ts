import type {
  CanonicalExecutionTrace,
  ExecutionEventType,
  ExecutionTraceStep,
  TraceEntityReference,
} from "@/contracts/events/trace-events";
import type { ContentPackage } from "@/content/schema/content-types";

import {
  resolveExecutionReferences,
  type SynchronizedCodeView,
  type SynchronizedPseudocodeView,
} from "./code-synchronization";
import {
  metricDelta,
  metricFocus,
  metricProgress,
  VISUALIZER_METRICS,
  type MetricDefinition,
} from "./metrics-v2";
import { explainVisualStep, type VisualExplanation } from "./visual-explanation-engine";

export type LearningExplanation = VisualExplanation & { changed: string };

export interface ComplexitySummary {
  best: string;
  average: string;
  worst: string;
  space: string;
}

export type CodeInspection = SynchronizedCodeView;
export type PseudocodeInspection = SynchronizedPseudocodeView;

export interface InspectorEntity {
  entityType: TraceEntityReference["entityType"];
  id: string;
  label: string;
}

export interface StateChange {
  before: string;
  after: string;
  changed: boolean;
}

export interface StepInspection {
  stepIndex: number;
  totalSteps: number;
  event: ExecutionEventType;
  operationLabel: string;
  payload: Record<string, unknown>;
  entities: InspectorEntity[];
  technicalState: Record<string, unknown>;
  stateChange: StateChange;
  metrics: Record<string, number>;
  metricDefinitions: readonly MetricDefinition[];
  metricDelta: Record<string, number>;
  focusedMetric?: keyof import("@/contracts/events/trace-events").TraceMetricSnapshot;
  metricProgress: number;
  explanation: LearningExplanation;
  complexity: ComplexitySummary | null;
  code: CodeInspection | null;
  pseudocode: PseudocodeInspection | null;
  nextEvent: ExecutionEventType | null;
  result: unknown;
  content: ContentPackage;
}

export const EVENT_LABELS: Record<ExecutionEventType, string> = {
  START: "execution starts",
  COMPARE: "values are compared",
  SWAP: "values are swapped",
  WRITE: "a value is written",
  READ: "a value is read",
  INSERT: "an item is inserted",
  REMOVE: "an item is removed",
  VISIT: "a node is visited",
  ENQUEUE: "an item enters the queue",
  DEQUEUE: "an item leaves the queue",
  PUSH: "an item is pushed",
  POP: "an item is popped",
  RELAX: "a shorter path is considered",
  SET_CURRENT: "the current position changes",
  FOUND: "the target is found",
  NOT_FOUND: "the target is not found",
  PARTITION: "a region is partitioned",
  MERGE: "regions are merged",
  ROTATE: "a rotation occurs",
  MARK_SORTED: "an item is marked sorted",
  SELECT: "a candidate is selected",
  PIVOT: "a pivot is selected",
  BACKTRACK: "the search backtracks",
  COMPLETE: "the execution completes",
};

export function inspectStep(
  content: ContentPackage,
  trace: CanonicalExecutionTrace,
  step: ExecutionTraceStep,
  nextStep?: ExecutionTraceStep,
  previousStep?: ExecutionTraceStep
): StepInspection {
  const payload = isRecord(step.event.payload) ? step.event.payload : {};
  const visualExplanation = explainVisualStep(content, step, nextStep);
  const explanation: LearningExplanation = {
    ...visualExplanation,
    changed: visualExplanation.result,
  };
  const references = resolveExecutionReferences(content, step);
  return {
    stepIndex: step.stepIndex,
    totalSteps: trace.steps.length,
    event: step.event.type,
    operationLabel: formatEvent(step.event.type),
    payload,
    entities: resolveEntities(step.event.references),
    technicalState: resolveTechnicalState(payload),
    stateChange: resolveStateChange(step),
    metrics: step.metrics as unknown as Record<string, number>,
    metricDefinitions: VISUALIZER_METRICS,
    metricDelta: metricDelta(previousStep?.metrics, step.metrics) as unknown as Record<
      string,
      number
    >,
    focusedMetric: metricFocus(step.event.type, metricDelta(previousStep?.metrics, step.metrics)),
    metricProgress: metricProgress(step.metrics, trace.metrics),
    explanation,
    complexity: content.metadata.complexity
      ? {
          best: content.metadata.complexity.timeBest,
          average: content.metadata.complexity.timeAverage,
          worst: content.metadata.complexity.timeWorst,
          space: content.metadata.complexity.space,
        }
      : null,
    code: references.code,
    pseudocode: references.pseudocode,
    nextEvent: nextStep?.event.type ?? null,
    result: trace.output,
    content,
  };
}

function resolveEntities(references?: TraceEntityReference[]): InspectorEntity[] {
  return (references ?? []).slice(0, 8).map((reference) => ({
    entityType: reference.entityType,
    id: String(reference.id),
    label: `${reference.entityType.replaceAll("-", " ")} ${reference.id}`,
  }));
}

function resolveTechnicalState(payload: Record<string, unknown>): Record<string, unknown> {
  const entries = Object.entries(payload)
    .filter(([key]) =>
      [
        "i",
        "j",
        "k",
        "left",
        "right",
        "mid",
        "current",
        "pivot",
        "target",
        "distance",
        "oldDistance",
        "oldG",
        "newG",
        "g",
        "h",
        "f",
        "oldF",
        "index",
        "from",
        "to",
        "queue",
        "stack",
        "openSet",
        "closedSet",
      ].includes(key)
    )
    .slice(0, 10);
  return Object.fromEntries(entries);
}

function resolveStateChange(step: ExecutionTraceStep): StateChange {
  const before = summarize(step.stateBefore);
  const after = summarize(step.stateAfter);
  return {
    before,
    after,
    changed: before !== after,
  };
}

function summarize(value: unknown): string {
  if (Array.isArray(value))
    return `[${value
      .slice(0, 8)
      .map((item) => String(item))
      .join(", ")}${value.length > 8 ? ", …" : ""}]`;
  if (isRecord(value)) {
    const entries = Object.entries(value)
      .slice(0, 4)
      .map(([key, item]) => `${key}=${summarize(item)}`);
    return `{${entries.join(", ")}${Object.keys(value).length > 4 ? ", …" : ""}}`;
  }
  return String(value);
}

function formatEvent(event: string): string {
  return event
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (character) => character.toUpperCase());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

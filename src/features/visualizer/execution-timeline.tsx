"use client";

import { useMemo, type CSSProperties } from "react";

import type { ExecutionTraceStep } from "@/contracts/events/trace-events";

import { getTraceWindow } from "./large-trace-strategy";
import { buildTimelineModel, isMarkedEvent, timelineProgress } from "./timeline-model";

export function ExecutionTimeline({
  steps,
  currentStep,
  searchMode = false,
  onSeek,
}: Readonly<{
  steps: ExecutionTraceStep[];
  currentStep: number;
  searchMode?: boolean;
  onSeek: (step: number) => void;
}>): React.JSX.Element {
  const windowed = useMemo(() => getTraceWindow(steps, currentStep), [steps, currentStep]);
  const model = useMemo(
    () => buildTimelineModel(windowed.steps, currentStep - windowed.start),
    [windowed.steps, currentStep, windowed.start]
  );
  const progress = timelineProgress(currentStep, steps.length);

  if (searchMode) {
    return <SearchExecutionTimeline steps={steps} currentStep={currentStep} onSeek={onSeek} />;
  }

  return (
    <section className="execution-timeline" aria-label="Execution timeline">
      <div className="execution-timeline__header">
        <div>
          <strong>Execution Timeline</strong>
          <span>
            {windowed.grouped
              ? ` ${steps.length} events · focused window for responsiveness`
              : model.isDense
                ? ` ${steps.length} events · grouped for clarity`
                : ""}
          </span>
        </div>
        <span>
          Step {currentStep + 1} / {steps.length}
        </span>
      </div>

      <div className="execution-timeline__scrubber">
        <label htmlFor="execution-timeline-scrubber">Scrub execution</label>
        <input
          id="execution-timeline-scrubber"
          type="range"
          min={0}
          max={Math.max(0, steps.length - 1)}
          value={currentStep}
          onChange={(event) => onSeek(Number(event.target.value))}
          style={{ "--timeline-progress": `${progress * 100}%` } as CSSProperties}
        />
      </div>

      <div
        className="execution-timeline__track"
        role="list"
        aria-label="Execution events"
        style={{ "--timeline-progress": `${progress * 100}%` } as CSSProperties}
      >
        {model.buckets.map((bucket) => {
          const isCurrent = bucket.containsCurrent;
          const marked = bucket.eventTypes.some((type) => isMarkedEvent(type));
          const label =
            bucket.startStep === bucket.endStep
              ? `Step ${bucket.startStep + 1}: ${bucket.eventTypes[0]}`
              : `Steps ${bucket.startStep + 1}–${bucket.endStep + 1}: ${bucket.dominantEvent ?? bucket.eventTypes.join(", ")}`;
          return (
            <button
              key={bucket.key}
              type="button"
              role="listitem"
              className={`execution-timeline__marker ${isCurrent ? "execution-timeline__marker--current" : ""}`}
              data-event={marked ? (bucket.dominantEvent ?? "OPERATION") : undefined}
              data-dense={model.isDense ? "true" : undefined}
              aria-label={label}
              aria-current={isCurrent ? "step" : undefined}
              onClick={() =>
                onSeek(isCurrent ? currentStep : windowed.start + bucket.representativeStep)
              }
              title={label}
            >
              <span>{bucket.startStep + 1}</span>
            </button>
          );
        })}
      </div>

      <div className="execution-timeline__milestones" aria-live="polite">
        <span>{steps[0]?.event.description ?? "Execution started"}</span>
        <span>{steps[currentStep]?.event.description ?? "Current execution step"}</span>
      </div>

      <div className="execution-timeline__legend" aria-label="Timeline legend">
        <span>Current step</span>
        <span>Semantic operation</span>
        {model.isDense ? <span>Grouped events</span> : null}
      </div>
    </section>
  );
}

function SearchExecutionTimeline({
  steps,
  currentStep,
  onSeek,
}: Readonly<{
  steps: ExecutionTraceStep[];
  currentStep: number;
  onSeek: (step: number) => void;
}>): React.JSX.Element {
  const comparisonSteps = steps.filter((step) => step.event.type === "COMPARE");
  const totalComparisons = Math.max(1, comparisonSteps.length);
  const currentComparisons = steps
    .slice(0, currentStep + 1)
    .filter((step) => step.event.type === "COMPARE").length;
  const selectedStep = steps[currentStep];
  const selectedIsResult =
    selectedStep?.event.type === "FOUND" ||
    selectedStep?.event.type === "NOT_FOUND" ||
    selectedStep?.event.type === "COMPLETE";
  const resultStep = steps.find(
    (step) => step.event.type === "FOUND" || step.event.type === "NOT_FOUND"
  );
  const logicalStep = Math.min(totalComparisons, Math.max(1, currentComparisons));
  const progress = selectedIsResult ? 100 : Math.min(100, (logicalStep / totalComparisons) * 100);
  const activeComparison =
    steps
      .slice(0, currentStep + 1)
      .slice()
      .reverse()
      .find((step) => step.event.type === "COMPARE") ?? comparisonSteps[0];
  const comparisonPayload = (activeComparison?.event.payload ?? {}) as Record<string, unknown>;
  const comparisonArray = Array.isArray(activeComparison?.stateAfter)
    ? (activeComparison.stateAfter as unknown[])
    : [];
  const middleIndex = typeof comparisonPayload.mid === "number" ? comparisonPayload.mid : undefined;
  const middleValue = middleIndex === undefined ? undefined : comparisonArray[middleIndex];
  const leftLabel =
    middleIndex !== undefined && typeof middleValue === "number"
      ? `Compare middle element (A[${middleIndex}] = ${middleValue})`
      : (activeComparison?.event.description ?? "Compare the middle element");
  const resultPayload = (resultStep?.event.payload ?? {}) as Record<string, unknown>;
  const rightLabel =
    resultStep?.event.type === "FOUND" && typeof resultPayload.index === "number"
      ? `Target found (index ${resultPayload.index})`
      : resultStep?.event.type === "NOT_FOUND"
        ? "Target not found"
        : "Search in progress";

  const seekLogicalStep = (value: number): void => {
    const next = Math.max(0, Math.min(totalComparisons, value));
    if (next === 0) {
      onSeek(comparisonSteps[0]?.stepIndex ?? 0);
      return;
    }
    if (next >= totalComparisons && resultStep) {
      onSeek(resultStep.stepIndex);
      return;
    }
    onSeek(comparisonSteps[Math.min(next, comparisonSteps.length - 1)]?.stepIndex ?? 0);
  };

  return (
    <section
      className="execution-timeline execution-timeline--search"
      aria-label="Execution timeline"
    >
      <div className="execution-timeline__header">
        <strong>Execution Timeline</strong>
        <span>
          Step {logicalStep} / {totalComparisons}
        </span>
      </div>
      <div className="execution-timeline__scrubber">
        <label htmlFor="search-execution-timeline">Scrub search steps</label>
        <input
          id="search-execution-timeline"
          type="range"
          min={0}
          max={totalComparisons}
          value={selectedIsResult ? totalComparisons : logicalStep}
          onChange={(event) => seekLogicalStep(Number(event.target.value))}
          style={{ "--timeline-progress": `${progress}%` } as CSSProperties}
        />
      </div>
      <div
        className="execution-timeline__search-track"
        role="list"
        aria-label="Search comparison milestones"
        data-complete={selectedIsResult ? "true" : "false"}
      >
        <span
          className="execution-timeline__search-line"
          style={{ "--search-progress": `${progress}%` } as CSSProperties}
        />
        {comparisonSteps.map((comparison, index) => (
          <button
            className={`execution-timeline__search-dot execution-timeline__search-dot--comparison${currentStep >= comparison.stepIndex ? " is-complete" : ""}`}
            key={`comparison-${comparison.stepIndex}`}
            type="button"
            role="listitem"
            aria-label={`Go to comparison ${index + 1}`}
            aria-current={currentStep === comparison.stepIndex ? "step" : undefined}
            onClick={() => onSeek(comparison.stepIndex)}
          />
        ))}
        <button
          className="execution-timeline__search-dot execution-timeline__search-dot--end"
          type="button"
          role="listitem"
          aria-label={rightLabel}
          aria-current={selectedIsResult ? "step" : undefined}
          onClick={() => onSeek(resultStep?.stepIndex ?? comparisonSteps.at(-1)?.stepIndex ?? 0)}
        />
      </div>
      <div className="execution-timeline__milestones" aria-live="polite">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </section>
  );
}

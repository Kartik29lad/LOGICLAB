"use client";

import { useMemo, type CSSProperties } from "react";

import type { ExecutionTraceStep } from "@/contracts/events/trace-events";

import { getTraceWindow } from "./large-trace-strategy";
import { buildTimelineModel, isMarkedEvent, timelineProgress } from "./timeline-model";

export function ExecutionTimeline({
  steps,
  currentStep,
  onSeek,
}: Readonly<{
  steps: ExecutionTraceStep[];
  currentStep: number;
  onSeek: (step: number) => void;
}>): React.JSX.Element {
  const windowed = useMemo(() => getTraceWindow(steps, currentStep), [steps, currentStep]);
  const model = useMemo(
    () => buildTimelineModel(windowed.steps, currentStep - windowed.start),
    [windowed.steps, currentStep, windowed.start]
  );
  const progress = timelineProgress(currentStep, steps.length);

  return (
    <section className="execution-timeline" aria-label="Execution timeline">
      <div className="execution-timeline__header">
        <div>
          <strong>Execution timeline</strong>
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

      <div className="execution-timeline__track" role="list" aria-label="Execution events">
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

      <div className="execution-timeline__legend" aria-label="Timeline legend">
        <span>Current step</span>
        <span>Semantic operation</span>
        {model.isDense ? <span>Grouped events</span> : null}
      </div>
    </section>
  );
}

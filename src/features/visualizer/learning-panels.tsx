"use client";

import { useState } from "react";

import type { TraceMetricSnapshot } from "@/contracts/events/trace-events";

import { createComplexityEducation } from "./complexity-education";
import { createExplanationExpansion, explanationSourceLabel } from "./explanation-expansion";
import type { StepInspection } from "./learning-inspector";

export function LearningPanels({ inspection }: { inspection: StepInspection }): React.JSX.Element {
  return (
    <div className="learning-panels">
      <section
        className="learning-card learning-card--operation"
        aria-labelledby="current-operation-title"
      >
        <div className="learning-card__header">
          <div>
            <p className="page-header__eyebrow">
              Current operation · Step {inspection.stepIndex + 1} of {inspection.totalSteps}
            </p>
            <h2 id="current-operation-title">{inspection.operationLabel}</h2>
            <p className="learning-short-explanation">{inspection.explanation.short}</p>
          </div>
          <span className="learning-event-badge">{inspection.event}</span>
        </div>
        <div className="learning-operation-grid">
          <ExplanationBlock title="State" text={inspection.explanation.state} />
          <ExplanationBlock title="Rule" text={inspection.explanation.rule} />
          <ExplanationBlock title="Decision" text={inspection.explanation.decision} />
          <ExplanationBlock title="Result" text={inspection.explanation.result} />
          <ExplanationBlock title="Next" text={inspection.explanation.next} />
        </div>
        <ExplanationExpansion inspection={inspection} />
        {inspection.entities.length > 0 ? (
          <div className="learning-entities" aria-label="Referenced visualization entities">
            {inspection.entities.map((entity) => (
              <span key={`${entity.entityType}-${entity.id}`} className="learning-entity">
                {entity.label}
              </span>
            ))}
          </div>
        ) : null}
        <details className="learning-expanded">
          <summary>Expand explanation & technical state</summary>
          <div className="learning-expanded__content">
            <ExplanationBlock title="What happened" text={inspection.explanation.what} />
            <ExplanationBlock title="Why this step" text={inspection.explanation.why} />
            <div>
              <strong>State change</strong>
              <div className="learning-state-diff">
                <code>{inspection.stateChange.before}</code>
                <span>→</span>
                <code>{inspection.stateChange.after}</code>
              </div>
            </div>
            {Object.keys(inspection.technicalState).length > 0 ? (
              <Detail title="Technical state" value={inspection.technicalState} />
            ) : null}
            <Detail title="Event payload" value={inspection.payload} />
          </div>
        </details>
      </section>
      <div className="learning-panel-grid">
        <RuntimePanel inspection={inspection} />
        <ComplexityPanel inspection={inspection} />
        <SynchronizedLogicPanel inspection={inspection} />
        <ResultPanel result={inspection.result} />
      </div>
    </div>
  );
}

function ExplanationBlock({ title, text }: { title: string; text: string }): React.JSX.Element {
  return (
    <div className="learning-explanation">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

function ExplanationExpansion({ inspection }: { inspection: StepInspection }): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const model = createExplanationExpansion(inspection.explanation.why);

  return (
    <section className="learning-explanation-expansion" aria-label="Expanded step explanation">
      <div className="learning-explanation-expansion__header">
        <div>
          <p className="page-header__eyebrow">Why this step</p>
          <h3>Reasoning behind the current operation</h3>
        </div>
        <span className="learning-explanation-source">
          {explanationSourceLabel(inspection.explanation.source)}
        </span>
      </div>
      <p className="learning-explanation-expansion__text">
        {expanded ? model.full : model.preview}
      </p>
      {model.expandable ? (
        <button
          type="button"
          className="learning-explanation-expansion__toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}
    </section>
  );
}

function RuntimePanel({ inspection }: { inspection: StepInspection }): React.JSX.Element {
  const focusLabel = inspection.focusedMetric
    ? inspection.metricDefinitions.find((metric) => metric.key === inspection.focusedMetric)?.label
    : undefined;
  return (
    <section className="learning-card">
      <div className="learning-card__header">
        <div>
          <p className="page-header__eyebrow">Trace-authoritative runtime data</p>
          <h2>Execution metrics</h2>
          <p className="learning-muted">
            Counts come from the canonical execution trace, not the UI.
          </p>
        </div>
      </div>
      <div className="learning-metric-progress" aria-label="Execution metric progress">
        <span style={{ width: `${Math.round(inspection.metricProgress * 100)}%` }} />
      </div>
      {focusLabel ? (
        <p className="learning-metric-focus" role="status">
          Current event increased <strong>{focusLabel}</strong>.
        </p>
      ) : null}
      <div className="learning-metric-list">
        {inspection.metricDefinitions.map((definition) => {
          const value = inspection.metrics[definition.key] ?? 0;
          const delta = inspection.metricDelta[definition.key] ?? 0;
          return (
            <Metric
              key={definition.key}
              label={definition.label}
              value={`${value}${definition.unit ? ` ${definition.unit}` : ""}`}
              detail={`${definition.description}${delta ? ` · +${delta} this step` : ""}`}
            />
          );
        })}
      </div>
    </section>
  );
}

function ComplexityPanel({ inspection }: { inspection: StepInspection }): React.JSX.Element {
  const education = createComplexityEducation(
    inspection.content,
    inspection.metrics as unknown as TraceMetricSnapshot
  );
  return (
    <section className="learning-card">
      <div className="learning-card__header">
        <div>
          <p className="page-header__eyebrow">Trusted metadata + learning context</p>
          <h2>Complexity</h2>
        </div>
      </div>
      {education ? (
        <div className="complexity-education">
          <p className="complexity-education__why">{education.why}</p>
          <div className="complexity-education__grid">
            <Metric label="Best time" value={education.time.best} />
            <Metric label="Average time" value={education.time.average} />
            <Metric label="Worst time" value={education.time.worst} />
            <Metric label="Space" value={education.space} />
          </div>
          {education.facts.length ? (
            <div className="complexity-education__facts">
              {education.facts.map((fact) => (
                <span key={fact}>{fact}</span>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="learning-muted">Complexity metadata is not available for this content.</p>
      )}
    </section>
  );
}

function SynchronizedLogicPanel({ inspection }: { inspection: StepInspection }): React.JSX.Element {
  const [view, setView] = useState<"code" | "pseudocode">("code");
  const code = inspection.code;
  const pseudocode = inspection.pseudocode;
  const active = view === "code" ? code : pseudocode;

  return (
    <section className="learning-card learning-code">
      <div className="learning-card__header">
        <div>
          <p className="page-header__eyebrow">Execution-synchronized reference</p>
          <h2>Logic</h2>
        </div>
        <div className="learning-view-toggle" role="group" aria-label="Logic representation">
          <button
            type="button"
            aria-pressed={view === "code"}
            onClick={() => setView("code")}
            disabled={!code}
          >
            Code
          </button>
          <button
            type="button"
            aria-pressed={view === "pseudocode"}
            onClick={() => setView("pseudocode")}
            disabled={!pseudocode}
          >
            Pseudocode
          </button>
        </div>
      </div>
      {active ? (
        <div className="learning-sync-status" data-synchronized={active.synchronized}>
          <span>
            {active.synchronized
              ? "Synchronized with current execution step"
              : "Reference available; this step has no mapped line"}
          </span>
          {view === "code" && code?.entryPoint ? <code>{code.entryPoint}</code> : null}
          {view === "pseudocode" && pseudocode?.sectionId ? (
            <code>{pseudocode.sectionId}</code>
          ) : null}
        </div>
      ) : (
        <p className="learning-muted">No {view} reference is available.</p>
      )}
      {active ? (
        <pre aria-label={view === "code" ? "Algorithm source code" : "Algorithm pseudocode"}>
          {active.source.split("\n").map((line, index) => (
            <code
              className={
                active.activeLines.includes(index + 1)
                  ? "learning-code__line learning-code__line--active"
                  : "learning-code__line"
              }
              key={`${index + 1}-${line}`}
            >
              <span>{String(index + 1).padStart(3, " ")}</span>
              {line || " "}
            </code>
          ))}
        </pre>
      ) : null}
    </section>
  );
}

function ResultPanel({ result }: { result: unknown }): React.JSX.Element {
  return (
    <section className="learning-card">
      <div className="learning-card__header">
        <div>
          <p className="page-header__eyebrow">Outcome</p>
          <h2>Final result</h2>
        </div>
      </div>
      <pre className="learning-result">{formatValue(result)}</pre>
    </section>
  );
}

function Detail({ title, value }: { title: string; value: unknown }): React.JSX.Element {
  return (
    <details className="learning-detail">
      <summary>{title}</summary>
      <pre>{formatValue(value)}</pre>
    </details>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}): React.JSX.Element {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </div>
  );
}
export function formatLabel(value: string): string {
  return value
    .replaceAll(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replace(/^./, (character) => character.toUpperCase());
}
function formatValue(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}

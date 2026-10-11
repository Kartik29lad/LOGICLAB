"use client";

import type { ReactNode } from "react";

import { CloseIcon, StepBackIcon, StepForwardIcon } from "@/components/navigation/icons";

export function PresentationMode({
  title,
  stepLabel,
  operation,
  explanation,
  visualization,
  onPrevious,
  onNext,
  onExit,
}: {
  title: string;
  stepLabel: string;
  operation: string;
  explanation: string;
  visualization: ReactNode;
  onPrevious: () => void;
  onNext: () => void;
  onExit: () => void;
}): React.JSX.Element {
  return (
    <div
      className="presentation-mode"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} presentation mode`}
    >
      <header className="presentation-mode__header">
        <div>
          <span className="presentation-mode__eyebrow">LogicLab Presentation</span>
          <h2>{title}</h2>
        </div>
        <button type="button" onClick={onExit} aria-label="Exit presentation mode">
          <CloseIcon aria-hidden="true" />
          <span>Exit</span>
        </button>
      </header>
      <main className="presentation-mode__main">
        <div className="presentation-mode__visual">{visualization}</div>
        <aside className="presentation-mode__explanation">
          <span>{stepLabel}</span>
          <strong>{operation}</strong>
          <p>{explanation}</p>
        </aside>
      </main>
      <footer className="presentation-mode__controls">
        <button type="button" onClick={onPrevious} aria-label="Previous step">
          <StepBackIcon aria-hidden="true" />
          <span>Previous</span>
        </button>
        <button type="button" onClick={onNext} aria-label="Next step">
          <StepForwardIcon aria-hidden="true" />
          <span>Next</span>
        </button>
      </footer>
    </div>
  );
}

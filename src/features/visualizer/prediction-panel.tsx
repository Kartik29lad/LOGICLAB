"use client";

import { useMemo, useState } from "react";

import type { CanonicalExecutionTrace } from "@/contracts/events/trace-events";

import { createPredictionChallenge, evaluatePrediction } from "./prediction-mode";

export function PredictionPanel({
  trace,
  step,
  onContinue,
}: {
  trace: CanonicalExecutionTrace<unknown, unknown, unknown>;
  step: number;
  onContinue: () => void;
}): React.JSX.Element | null {
  const challenge = useMemo(() => createPredictionChallenge(trace, step), [trace, step]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [result, setResult] = useState<ReturnType<typeof evaluatePrediction> | null>(null);
  if (!challenge) return null;
  const submit = (optionId: string) => {
    if (result) return;
    setAnswer(optionId);
    setResult(evaluatePrediction(challenge, optionId));
  };
  return (
    <section className="prediction-panel" aria-label="Predict the next execution step">
      <header>
        <div>
          <span className="prediction-panel__eyebrow">Prediction Mode</span>
          <h2>What happens next?</h2>
          <p>
            Use the current state to predict the next execution event before LogicLab reveals it.
          </p>
        </div>
        <span className="prediction-panel__step">Step {step + 1}</span>
      </header>
      <div className="prediction-panel__options">
        {challenge.options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={Boolean(result)}
            aria-pressed={answer === option.id}
            data-correct={result && option.id === challenge.actual.id ? "true" : undefined}
            data-wrong={result && answer === option.id && !result.correct ? "true" : undefined}
            onClick={() => submit(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {result ? (
        <div className="prediction-panel__feedback" role="status">
          <strong>{result.correct ? "Correct prediction" : "Not quite"}</strong>
          <span>
            Actual next event: <b>{result.actual.label}</b>
          </span>
          <p>{result.explanation}</p>
          <button
            type="button"
            onClick={() => {
              setAnswer(null);
              setResult(null);
              onContinue();
            }}
          >
            Reveal and continue
          </button>
        </div>
      ) : (
        <p className="prediction-panel__hint">Predict first, then reveal the actual execution.</p>
      )}
    </section>
  );
}

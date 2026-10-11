"use client";

import { useMemo, useState } from "react";

import {
  ARRAY_INPUT_PRESETS,
  defaultArrayInput,
  formatArrayInput,
  parseArrayInput,
  validateArrayExperiment,
} from "./array-input";

interface ArrayInputPanelProps {
  slug: string;
  disabled?: boolean;
  onApply: (values: number[], target?: number) => void;
}

const SEARCH_SLUGS = new Set(["linear-search", "binary-search"]);

export function ArrayInputPanel({
  slug,
  disabled = false,
  onApply,
}: ArrayInputPanelProps): React.JSX.Element {
  const initial = useMemo(() => defaultArrayInput(slug), [slug]);
  const [draft, setDraft] = useState(() => formatArrayInput(initial.values));
  const [target, setTarget] = useState(() => String(initial.target ?? 9));
  const [error, setError] = useState<string | null>(null);
  const isSearch = SEARCH_SLUGS.has(slug);

  const apply = (): void => {
    const parsed = parseArrayInput(draft);
    if (!parsed.values) {
      setError(parsed.error ?? "Enter a valid numeric array.");
      return;
    }
    const numericTarget = isSearch ? Number(target.trim()) : undefined;
    const validationError = validateArrayExperiment(slug, parsed.values, numericTarget);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onApply(parsed.values, numericTarget);
  };

  const selectPreset = (presetId: string): void => {
    const preset = ARRAY_INPUT_PRESETS.find((candidate) => candidate.id === presetId);
    if (!preset) return;
    setDraft(formatArrayInput(preset.values));
    if (preset.target !== undefined) setTarget(String(preset.target));
    setError(null);
  };

  return (
    <section className="array-input-panel" aria-label="Array experiment input">
      <div className="array-input-panel__header">
        <div>
          <p className="page-header__eyebrow">Experiment Input</p>
          <h2>Build your array</h2>
          <p>Change the data, run the algorithm again, and compare how the execution changes.</p>
        </div>
        <span className="array-input-panel__limit">Maximum 100 values</span>
      </div>

      <div className="array-input-panel__body">
        <label className="array-input-field">
          <span>Array values</span>
          <textarea
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              if (error) setError(null);
            }}
            placeholder="7, 3, 9, 2, 5"
            rows={3}
            disabled={disabled}
            aria-describedby={error ? "array-input-error" : "array-input-help"}
          />
          <small id="array-input-help">
            Use commas, spaces, or new lines between numbers. Duplicates are allowed.
          </small>
        </label>

        {isSearch ? (
          <label className="array-input-field array-input-field--target">
            <span>Search target</span>
            <input
              value={target}
              onChange={(event) => {
                setTarget(event.target.value);
                if (error) setError(null);
              }}
              inputMode="decimal"
              disabled={disabled}
            />
            <small>
              {slug === "binary-search"
                ? "The array must be sorted in ascending order."
                : "The algorithm searches for the first matching value."}
            </small>
          </label>
        ) : null}

        <div className="array-input-actions">
          <button
            type="button"
            className="button button--primary"
            onClick={apply}
            disabled={disabled}
          >
            Run with this input
          </button>
          <button
            type="button"
            className="button"
            onClick={() => {
              const preset = defaultArrayInput(slug);
              setDraft(formatArrayInput(preset.values));
              setTarget(String(preset.target ?? 9));
              setError(null);
            }}
            disabled={disabled}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="array-input-presets" aria-label="Array presets">
        <span>Presets</span>
        {ARRAY_INPUT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => selectPreset(preset.id)}
            disabled={disabled}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {error ? (
        <p id="array-input-error" className="array-input-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}

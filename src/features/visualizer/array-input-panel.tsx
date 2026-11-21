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

const BINARY_SEARCH_PRESETS = [
  { id: "classic", label: "Classic", values: [2, 5, 7, 9, 13, 18, 21], target: 9 },
  { id: "search-ready", label: "Search ready", values: [1, 3, 5, 7, 9, 11, 13], target: 7 },
  { id: "nearly-sorted", label: "Nearly sorted", values: [2, 4, 6, 8, 10, 12, 14], target: 10 },
  { id: "reverse-order", label: "Reverse order", values: [21, 18, 13, 9, 7, 5, 2], target: 9 },
];

export function ArrayInputPanel({
  slug,
  disabled = false,
  onApply,
}: ArrayInputPanelProps): React.JSX.Element {
  const initial = useMemo(() => defaultArrayInput(slug), [slug]);
  const [draft, setDraft] = useState(() => formatArrayInput(initial.values));
  const [target, setTarget] = useState(() => String(initial.target ?? 9));
  const [error, setError] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(() =>
    slug === "binary-search" ? "classic" : initial.id
  );
  const isSearch = SEARCH_SLUGS.has(slug);
  const isBinarySearch = slug === "binary-search";
  const presets = isBinarySearch ? BINARY_SEARCH_PRESETS : ARRAY_INPUT_PRESETS;

  const apply = (): void => {
    const parsed = parseArrayInput(draft);
    if (!parsed.values) {
      setError(parsed.error ?? "Enter a valid numeric array.");
      return;
    }
    const numericTarget = isSearch
      ? target.trim()
        ? Number(target.trim())
        : Number.NaN
      : undefined;
    const validationError = validateArrayExperiment(slug, parsed.values, numericTarget);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onApply(parsed.values, numericTarget);
  };

  const selectPreset = (presetId: string): void => {
    const preset = presets.find((candidate) => candidate.id === presetId);
    if (!preset) return;
    setDraft(formatArrayInput(preset.values));
    if (preset.target !== undefined) setTarget(String(preset.target));
    setSelectedPresetId(presetId);
    setError(null);
  };

  return (
    <section
      className="array-input-panel"
      aria-label="Array experiment input"
      data-visualizer-slug={slug}
    >
      <div className="array-input-panel__header">
        <div>
          <p className="page-header__eyebrow">Experiment Input</p>
          <h2>Build your array</h2>
          <p>Change the data, run the algorithm again, and compare how the execution changes.</p>
        </div>
        {isBinarySearch ? null : (
          <span className="array-input-panel__limit">Maximum 100 values</span>
        )}
      </div>

      <div className="array-input-panel__body">
        <label className="array-input-field">
          <span>{isBinarySearch ? "Array (sorted, comma separated)" : "Array values"}</span>
          <textarea
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setSelectedPresetId(null);
              if (error) setError(null);
            }}
            placeholder="7, 3, 9, 2, 5"
            rows={isBinarySearch ? 1 : 2}
            disabled={disabled}
            aria-describedby={error ? "array-input-error" : "array-input-help"}
          />
          {isBinarySearch ? (
            <small className="array-input-field__limit">Maximum 100 values</small>
          ) : null}
          <small
            id="array-input-help"
            className={isBinarySearch ? "array-input-help--sorted" : undefined}
          >
            {isBinarySearch ? (
              <>
                <svg
                  viewBox="0 0 20 20"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <circle cx="10" cy="10" r="7.5" />
                  <path d="M10 9v4m0-6h.01" strokeLinecap="round" />
                </svg>
                Binary search requires the array to be sorted in ascending or descending order.
              </>
            ) : (
              "Use commas, spaces, or new lines between numbers. Duplicates are allowed."
            )}
          </small>
        </label>

        {isSearch ? (
          <label className="array-input-field array-input-field--target">
            <span>Search target</span>
            <input
              type="number"
              step="any"
              value={target}
              onChange={(event) => {
                setTarget(event.target.value);
                setSelectedPresetId(null);
                if (error) setError(null);
              }}
              inputMode="decimal"
              disabled={disabled}
            />
            <small>
              {slug === "binary-search"
                ? "The array must be sorted in ascending or descending order."
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
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
              <path d="M7 4.8v14.4L19 12 7 4.8Z" />
            </svg>
            Run with this input
          </button>
          <button
            type="button"
            className="button"
            onClick={() => {
              const preset = defaultArrayInput(slug);
              setDraft(formatArrayInput(preset.values));
              setTarget(String(preset.target ?? 9));
              setSelectedPresetId(isBinarySearch ? "classic" : preset.id);
              setError(null);
            }}
            disabled={disabled}
          >
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 11a8 8 0 0 0-14.9-3L3 11m0-5v5h5M4 13a8 8 0 0 0 14.9 3L21 13m0 5v-5h-5" />
            </svg>
            Reset
          </button>
        </div>
      </div>

      <div className="array-input-presets" aria-label="Array presets">
        <span>Presets</span>
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => selectPreset(preset.id)}
            disabled={disabled}
            aria-pressed={selectedPresetId === preset.id}
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

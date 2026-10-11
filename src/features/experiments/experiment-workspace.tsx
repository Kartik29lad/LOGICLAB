"use client";

import { useEffect, useMemo, useState } from "react";

import { createExperimentSnapshot, createReproducibilityKey } from "./experiment-framework";

type Result = {
  slug: string;
  name: string;
  result: unknown;
  metrics: Record<string, number>;
  complexity: Record<string, string>;
};
type SavedExperiment = {
  ExperimentId?: string;
  Name?: string;
  InputData?: unknown;
  CreatedAt?: string;
};

const algorithms = [
  "bubble-sort",
  "insertion-sort",
  "selection-sort",
  "merge-sort",
  "quick-sort",
  "heap-sort",
] as const;
const names: Record<string, string> = {
  "bubble-sort": "Bubble Sort",
  "insertion-sort": "Insertion Sort",
  "selection-sort": "Selection Sort",
  "merge-sort": "Merge Sort",
  "quick-sort": "Quick Sort",
  "heap-sort": "Heap Sort",
};
const presets = [
  { name: "Mixed", input: "[9, 4, 7, 2, 8, 1, 5]" },
  { name: "Nearly sorted", input: "[1, 2, 3, 5, 4, 6, 7]" },
  { name: "Reverse", input: "[9, 8, 7, 6, 5, 4, 3]" },
  { name: "Duplicates", input: "[5, 2, 5, 3, 2, 5, 1]" },
];

export function ExperimentWorkspace() {
  const [selected, setSelected] = useState<string[]>(["bubble-sort", "merge-sort"]);
  const [input, setInput] = useState("[9, 4, 7, 2, 8, 1, 5]");
  const [title, setTitle] = useState("Sorting experiment");
  const [seed, setSeed] = useState("42");
  const [results, setResults] = useState<Result[]>([]);
  const [history, setHistory] = useState<SavedExperiment[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    void fetch("/api/experiments")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => setHistory(Array.isArray(payload?.items) ? payload.items : []))
      .catch(() => undefined);
  }, []);

  const maxSteps = useMemo(
    () => Math.max(0, ...results.map((result) => result.metrics.steps ?? 0)),
    [results]
  );
  function toggle(slug: string) {
    setSelected((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : current.length < 6
          ? [...current, slug]
          : current
    );
  }
  function validateInput(): unknown {
    const parsed = JSON.parse(input);
    if (
      !Array.isArray(parsed) ||
      parsed.length === 0 ||
      parsed.length > 100 ||
      parsed.some((value) => typeof value !== "number" || !Number.isFinite(value))
    )
      throw new Error("Input must be a JSON array of 1–100 finite numbers.");
    if (selected.length < 2) throw new Error("Select at least two algorithms.");
    return parsed;
  }
  async function run() {
    setBusy(true);
    setError("");
    try {
      const parsed = validateInput();
      const numericSeed = Number(seed);
      if (!Number.isInteger(numericSeed)) throw new Error("Seed must be an integer.");
      const snapshot = createExperimentSnapshot({
        title: title.trim(),
        algorithmSlugs: selected,
        input: parsed,
        seed: numericSeed,
      });
      const reproducibilityKey = createReproducibilityKey(snapshot);
      const response = await fetch("/api/experiments", {
        method: "POST",
        headers: { "content-type": "application/json", "Idempotency-Key": reproducibilityKey },
        body: JSON.stringify(snapshot),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Experiment failed.");
      setResults(payload.results as Result[]);
      setHistory((current) =>
        [{ Name: title, ExperimentId: payload.experimentId }, ...current].slice(0, 12)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Experiment failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="experiment-workspace">
      <div className="experiment-workspace__controls">
        <label>
          Experiment name
          <input value={title} maxLength={200} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          Input JSON
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={4}
            spellCheck={false}
          />
        </label>
        <div className="experiment-presets" aria-label="Input presets">
          {presets.map((preset) => (
            <button type="button" key={preset.name} onClick={() => setInput(preset.input)}>
              {preset.name}
            </button>
          ))}
        </div>
        <label>
          Reproducibility seed
          <input
            value={seed}
            onChange={(event) => setSeed(event.target.value)}
            inputMode="numeric"
          />
        </label>
        <fieldset>
          <legend>
            Algorithms <small>{selected.length}/6</small>
          </legend>
          {algorithms.map((slug) => (
            <label key={slug} className="experiment-choice">
              <input
                type="checkbox"
                checked={selected.includes(slug)}
                onChange={() => toggle(slug)}
              />
              {names[slug]}
            </label>
          ))}
        </fieldset>
        <button
          type="button"
          className="button button--primary"
          disabled={busy || selected.length < 2}
          onClick={run}
        >
          {busy ? "Running…" : "Run experiment"}
        </button>
        {error && (
          <p className="status-message status-message--error" role="alert">
            {error}
          </p>
        )}
        <button
          type="button"
          className="button button--secondary"
          onClick={() => setHistoryOpen((open) => !open)}
        >
          {historyOpen ? "Hide" : "Show"} saved experiments
        </button>
        {historyOpen && (
          <div className="experiment-history">
            <strong>Recent runs</strong>
            {history.length ? (
              history.map((item, index) => (
                <button
                  type="button"
                  key={item.ExperimentId ?? `${item.Name}-${index}`}
                  onClick={() => item.Name && setTitle(item.Name)}
                >
                  {item.Name ?? "Untitled experiment"}
                </button>
              ))
            ) : (
              <span>No saved runs yet.</span>
            )}
          </div>
        )}
      </div>
      <div className="experiment-workspace__results">
        <header className="experiment-results-header">
          <div>
            <h2>Validated results</h2>
            <p>
              {results.length
                ? `Compared ${results.length} algorithms from the same input and seed.`
                : "Compare correctness, operations, complexity, and runtime from one controlled input."}
            </p>
            {results.length ? (
              <small className="experiment-reproducibility">Deterministic run · seed {seed}</small>
            ) : null}
          </div>
          {results.length ? (
            <button type="button" onClick={() => setResults([])}>
              Clear results
            </button>
          ) : null}
        </header>
        {results.length === 0 ? (
          <div className="experiment-empty">
            <strong>Ready for an experiment</strong>
            <span>Choose a preset or edit the JSON, then run at least two algorithms.</span>
          </div>
        ) : (
          <div className="comparison-grid">
            {results.map((result) => {
              const metrics = result.metrics;
              const progress = maxSteps ? (metrics.steps ?? 0) / maxSteps : 0;
              return (
                <article className="comparison-card" key={result.slug}>
                  <header>
                    <h3>{result.name}</h3>
                    <span>{result.complexity.average}</span>
                  </header>
                  <div className="comparison-bar" aria-label={`${result.name} relative step count`}>
                    <i style={{ width: `${Math.max(3, progress * 100)}%` }} />
                  </div>
                  <dl>
                    <div>
                      <dt>Steps</dt>
                      <dd>{metrics.steps}</dd>
                    </div>
                    <div>
                      <dt>Comparisons</dt>
                      <dd>{metrics.comparisons ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Swaps</dt>
                      <dd>{metrics.swaps ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Time</dt>
                      <dd>{(metrics.durationMs ?? 0).toFixed(3)} ms</dd>
                    </div>
                  </dl>
                  <p>
                    <strong>Result</strong> verified by the execution service.
                  </p>
                  <pre>{JSON.stringify(result.result, null, 2)}</pre>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

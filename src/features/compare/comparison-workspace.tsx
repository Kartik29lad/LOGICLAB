"use client";

import { useState } from "react";
import Link from "next/link";

const ALGORITHMS = [
  "bubble-sort",
  "insertion-sort",
  "selection-sort",
  "merge-sort",
  "quick-sort",
  "heap-sort",
] as const;

const ALGORITHM_NAMES: Record<(typeof ALGORITHMS)[number], string> = {
  "bubble-sort": "Bubble Sort",
  "insertion-sort": "Insertion Sort",
  "selection-sort": "Selection Sort",
  "merge-sort": "Merge Sort",
  "quick-sort": "Quick Sort",
  "heap-sort": "Heap Sort",
};

const PRESETS = [
  { label: "Default", value: "[10, 3, 8, 2, 7, 1]" },
  { label: "Reversed", value: "[12, 10, 8, 6, 4, 2]" },
  { label: "Nearly Sorted", value: "[1, 2, 4, 3, 5, 6]" },
  { label: "Random", value: "[45, 12, 89, 34, 23, 7]" },
  { label: "Duplicates", value: "[5, 2, 8, 2, 5, 1, 8]" },
];

interface ComparisonResult {
  slug: string;
  name: string;
  result: unknown;
  metrics: {
    steps: number;
    comparisons?: number;
    swaps?: number;
    durationMs?: number;
    [key: string]: unknown;
  };
  complexity: {
    best: string;
    average: string;
    worst: string;
    space: string;
  };
}

export function ComparisonWorkspace() {
  const [selected, setSelected] = useState<string[]>(["bubble-sort", "merge-sort"]);
  const [input, setInput] = useState("[10, 3, 8, 2, 7, 1]");
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleAlgorithm = (slug: string) => {
    if (selected.includes(slug)) {
      if (selected.length <= 2) {
        setError("At least 2 algorithms must remain selected for comparison.");
        return;
      }
      setSelected((prev) => prev.filter((item) => item !== slug));
      setError("");
    } else {
      if (selected.length >= 6) {
        setError("A maximum of 6 algorithms can be compared simultaneously.");
        return;
      }
      setSelected((prev) => [...prev, slug]);
      setError("");
    }
  };

  const handleReset = () => {
    setSelected(["bubble-sort", "merge-sort"]);
    setInput("[10, 3, 8, 2, 7, 1]");
    setResults([]);
    setError("");
  };

  async function compare() {
    setError("");

    // Validate input format on the client before making network requests
    let parsedInput: unknown;
    try {
      parsedInput = JSON.parse(input);
    } catch {
      setError("Input must be valid JSON format, e.g. [10, 3, 8, 2, 7, 1]");
      return;
    }

    if (
      !Array.isArray(parsedInput) ||
      parsedInput.length === 0 ||
      parsedInput.some((v) => typeof v !== "number" || !Number.isFinite(v))
    ) {
      setError("Input must be a non-empty array of finite numbers (e.g. [10, 3, 8, 2, 7, 1]).");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/comparisons", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ algorithmSlugs: selected, input: parsedInput }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Comparison failed.");
      }
      setResults(payload.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison execution failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="comparison-workspace" aria-label="Algorithm comparison workspace">
      <div className="card comparison-toolbar">
        <div className="comparison-section">
          <div className="comparison-section__header">
            <h3>Algorithms to Compare</h3>
            <span className="badge badge--subtle">{selected.length} / 6 selected (min 2)</span>
          </div>
          <div className="comparison-algorithm-chips">
            {ALGORITHMS.map((slug) => {
              const isSelected = selected.includes(slug);
              return (
                <button
                  type="button"
                  key={slug}
                  className={`button button--sm ${isSelected ? "button--primary" : "button--secondary"}`}
                  onClick={() => toggleAlgorithm(slug)}
                  aria-pressed={isSelected}
                >
                  <span className="chip-indicator" aria-hidden="true">
                    {isSelected ? "✓" : "+"}
                  </span>
                  {ALGORITHM_NAMES[slug]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="comparison-section">
          <div className="comparison-section__header">
            <label htmlFor="comparison-input">
              <h3>Input Dataset</h3>
            </label>
            <div className="comparison-presets" role="group" aria-label="Preset datasets">
              <span className="text-caption text-muted">Presets:</span>
              {PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  className="button button--secondary button--sm"
                  onClick={() => setInput(preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <textarea
            id="comparison-input"
            className="input-code monospace"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={2}
            placeholder="[10, 3, 8, 2, 7, 1]"
            spellCheck={false}
          />
        </div>

        <div className="comparison-actions">
          <button
            type="button"
            className="button button--primary"
            disabled={selected.length < 2 || loading}
            onClick={compare}
          >
            {loading ? "Simulating Executions..." : "Compare Executions"}
          </button>
          <button
            type="button"
            className="button button--secondary"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </button>
        </div>

        {error && (
          <div className="status-message status-message--error" role="alert">
            {error}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="comparison-results-container">
          <div className="comparison-results__header">
            <h2>Benchmark Results</h2>
            <span className="text-muted text-caption">
              {results.length} algorithms executed against identical dataset
            </span>
          </div>
          <div className="comparison-grid">
            {results.map((result) => {
              const metrics = result.metrics;
              return (
                <article className="card comparison-card" key={result.slug}>
                  <div className="comparison-card__header">
                    <div>
                      <h3 className="comparison-card__title">{result.name}</h3>
                      <span className="badge badge--primary">
                        {result.complexity.average} Average
                      </span>
                    </div>
                    <div className="comparison-card__links">
                      <Link
                        href={`/visualizer/${result.slug}`}
                        className="button button--secondary button--sm"
                      >
                        Visualizer ↗
                      </Link>
                      <Link
                        href={`/algorithms/${result.slug}`}
                        className="button button--secondary button--sm"
                      >
                        Details
                      </Link>
                    </div>
                  </div>

                  <div className="comparison-card__complexity-grid">
                    <div className="complexity-cell">
                      <span className="cell-label">Best Time</span>
                      <code className="cell-value">{result.complexity.best}</code>
                    </div>
                    <div className="complexity-cell">
                      <span className="cell-label">Average Time</span>
                      <code className="cell-value">{result.complexity.average}</code>
                    </div>
                    <div className="complexity-cell">
                      <span className="cell-label">Worst Time</span>
                      <code className="cell-value">{result.complexity.worst}</code>
                    </div>
                    <div className="complexity-cell">
                      <span className="cell-label">Aux Space</span>
                      <code className="cell-value">{result.complexity.space}</code>
                    </div>
                  </div>

                  <dl className="comparison-metrics-list">
                    <div className="metric-box">
                      <dt>Total Steps</dt>
                      <dd>{metrics.steps}</dd>
                    </div>
                    <div className="metric-box">
                      <dt>Comparisons</dt>
                      <dd>{metrics.comparisons ?? "—"}</dd>
                    </div>
                    <div className="metric-box">
                      <dt>Swaps</dt>
                      <dd>{metrics.swaps ?? "—"}</dd>
                    </div>
                    <div className="metric-box">
                      <dt>Execution Time</dt>
                      <dd>
                        {typeof metrics.durationMs === "number" && metrics.durationMs > 0
                          ? `${metrics.durationMs.toFixed(2)} ms`
                          : "< 1 ms"}
                      </dd>
                    </div>
                  </dl>

                  <div className="comparison-card__output">
                    <span className="output-label">Sorted Output:</span>
                    <pre className="monospace">{JSON.stringify(result.result)}</pre>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {results.length === 0 && !loading && (
        <div className="card comparison-empty-guide">
          <h3>Ready to Benchmark</h3>
          <p>
            Select between 2 and 6 sorting algorithms above, modify or pick a preset input array,
            and click <strong>Compare Executions</strong> to analyze exact operation steps,
            comparisons, swaps, and asymptotic complexities side-by-side.
          </p>
        </div>
      )}
    </section>
  );
}

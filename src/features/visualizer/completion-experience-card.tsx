"use client";

interface CompletionStats {
  result: string;
  steps: number;
  comparisons: number;
  swaps: number;
  visits: number;
}

interface CompletionExperienceCardProps {
  completion: CompletionStats;
  saveState: "idle" | "saving" | "saved" | "error";
  savedExperimentId: string | null;
  saveError: string | null;
  onRestart: () => void;
  onReviewFromStart: () => void;
  onSaveExperiment: () => void;
}

export function CompletionExperienceCard({
  completion,
  saveState,
  savedExperimentId,
  saveError,
  onRestart,
  onReviewFromStart,
  onSaveExperiment,
}: CompletionExperienceCardProps): React.JSX.Element {
  return (
    <section className="completion-experience" aria-label="Execution complete">
      <div>
        <span>Execution complete</span>
        <h2>Algorithm finished successfully</h2>
        <p>{completion.result}</p>
      </div>
      <div className="completion-experience__stats">
        <span>
          <strong>{completion.steps}</strong> steps
        </span>
        <span>
          <strong>{completion.comparisons}</strong> comparisons
        </span>
        <span>
          <strong>{completion.swaps}</strong> swaps
        </span>
        <span>
          <strong>{completion.visits}</strong> visits
        </span>
      </div>
      <div className="completion-experience__actions">
        <button type="button" onClick={onRestart}>
          Run again
        </button>
        <button type="button" onClick={onReviewFromStart}>
          Review from start
        </button>
        <button
          type="button"
          onClick={onSaveExperiment}
          disabled={saveState === "saving" || saveState === "saved"}
        >
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save experiment"}
        </button>
      </div>
      <div
        className="visualizer-save-status"
        data-state={saveState}
        role={saveState === "error" ? "alert" : "status"}
      >
        {saveState === "saved"
          ? `Saved experiment ${savedExperimentId}.`
          : (saveError ??
            (saveState === "idle"
              ? "Save this deterministic run to your experiment history."
              : "Saving this run…"))}
      </div>
    </section>
  );
}

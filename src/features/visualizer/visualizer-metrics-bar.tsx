"use client";

interface VisualizerMetricsBarProps {
  step: number;
  slug?: string;
  metrics?: Readonly<Record<string, number>>;
}

type MetricKind = "step" | "comparisons" | "swaps" | "writes" | "visits";

function MetricIcon({ kind }: { kind: MetricKind }): React.JSX.Element {
  if (kind === "step") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m12 3 9 4.5-9 4.5-9-4.5L12 3Z" />
        <path d="m3 12 9 4.5 9-4.5M3 16.5 12 21l9-4.5" />
      </svg>
    );
  }
  if (kind === "comparisons" || kind === "swaps") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 8h15m-4-4 4 4-4 4M20 16H5m4-4-4 4 4 4" />
      </svg>
    );
  }
  if (kind === "writes") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m14 5 5 5M4 20l4.2-.9L19 8.3a2.1 2.1 0 0 0-3-3L5.2 16.1 4 20Z" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export function VisualizerMetricsBar({
  step,
  slug,
  metrics,
}: VisualizerMetricsBarProps): React.JSX.Element {
  // A midpoint comparison inspects one array element, so it also counts as a visit.
  const visits =
    slug === "binary-search"
      ? Math.max(metrics?.visits ?? 0, metrics?.comparisons ?? 0)
      : (metrics?.visits ?? 0);
  const cards: { kind: MetricKind; label: string; value: number }[] = [
    { kind: "step", label: "Step", value: step + 1 },
    { kind: "comparisons", label: "Comparisons", value: metrics?.comparisons ?? 0 },
    { kind: "swaps", label: "Swaps", value: metrics?.swaps ?? 0 },
    { kind: "writes", label: "Writes", value: metrics?.writes ?? 0 },
    { kind: "visits", label: "Visits", value: visits },
  ];

  return (
    <>
      <div className="visualizer-meta" aria-label="Execution metrics">
        {cards.map((card) => (
          <div className="visualizer-meta__card" key={card.kind}>
            <span className="visualizer-meta__icon" data-kind={card.kind} aria-hidden="true">
              <MetricIcon kind={card.kind} />
            </span>
            <span className="visualizer-meta__content">
              <strong>{card.label}</strong>
              <b>{card.value}</b>
            </span>
          </div>
        ))}
      </div>
      <p className="visualizer-note">
        Run again uses the same deterministic trace model. Playback speed changes timing only; it
        never changes algorithm state.
      </p>
    </>
  );
}

"use client";

interface VisualizerMetricsBarProps {
  step: number;
  metrics?: Readonly<Record<string, number>>;
}

export function VisualizerMetricsBar({
  step,
  metrics,
}: VisualizerMetricsBarProps): React.JSX.Element {
  return (
    <>
      <div className="visualizer-meta">
        <div>
          <strong>Step</strong>
          <span>{step + 1}</span>
        </div>
        <div>
          <strong>Comparisons</strong>
          <span>{metrics?.comparisons ?? 0}</span>
        </div>
        <div>
          <strong>Swaps</strong>
          <span>{metrics?.swaps ?? 0}</span>
        </div>
        <div>
          <strong>Writes</strong>
          <span>{metrics?.writes ?? 0}</span>
        </div>
        <div>
          <strong>Visits</strong>
          <span>{metrics?.visits ?? 0}</span>
        </div>
      </div>
      <p className="visualizer-note">
        Run again uses the same deterministic trace model. Playback speed changes timing only; it
        never changes algorithm state.
      </p>
    </>
  );
}

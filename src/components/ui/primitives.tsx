"use client";

import { Button } from "./button";

export function IconButton({
  label,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button type="button" className="icon-button" aria-label={label} {...props}>
      {children}
    </button>
  );
}

export function Panel({
  title,
  description,
  children,
  className = "",
}: Readonly<{
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <section className={`panel ${className}`.trim()}>
      {title || description ? (
        <header className="panel__header">
          <div>
            {title ? <h2>{title}</h2> : null}
            {description ? <p className="detail-muted">{description}</p> : null}
          </div>
        </header>
      ) : null}
      <div className="panel__body">{children}</div>
    </section>
  );
}

export function Metric({ label, value }: Readonly<{ label: string; value: React.ReactNode }>) {
  return (
    <div className="metric">
      <span className="metric__label">{label}</span>
      <strong className="metric__value">{value}</strong>
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  ...props
}: Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "min" | "max" | "step" | "onChange"
> & {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        className="slider"
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        {...props}
      />
    </label>
  );
}

export function PlaybackControls({
  playing,
  onPrevious,
  onToggle,
  onNext,
  onRestart,
  previousDisabled,
  nextDisabled,
}: Readonly<{
  playing: boolean;
  onPrevious: () => void;
  onToggle: () => void;
  onNext: () => void;
  onRestart: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
}>) {
  return (
    <div className="playback-controls" aria-label="Playback controls">
      <Button variant="secondary" size="sm" onClick={onPrevious} disabled={previousDisabled}>
        Previous
      </Button>
      <Button variant="primary" size="sm" onClick={onToggle}>
        {playing ? "Pause" : "Play"}
      </Button>
      <Button variant="secondary" size="sm" onClick={onNext} disabled={nextDisabled}>
        Next
      </Button>
      <Button variant="ghost" size="sm" onClick={onRestart}>
        Restart
      </Button>
    </div>
  );
}

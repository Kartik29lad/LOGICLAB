"use client";

import {
  PLAYBACK_SPEEDS,
  type PlaybackStatus,
} from "@/core/visualization/playback/playback-controller";
import {
  PauseIcon,
  PlayIcon,
  RestartIcon,
  StepBackIcon,
  StepForwardIcon,
} from "@/components/navigation/icons";
import { BookmarkButton } from "@/features/activity/bookmark-button";

interface VisualizerPlaybackBarProps {
  slug: string;
  step: number;
  maxStep: number;
  status: PlaybackStatus;
  speed: number;
  hasTrace: boolean;
  keyboardHint: string;
  onRun: (action: "play" | "pause" | "next" | "previous" | "restart") => void;
  onSpeedChange: (speed: number) => void;
}

export function VisualizerPlaybackBar({
  slug,
  step,
  maxStep,
  status,
  speed,
  hasTrace,
  keyboardHint,
  onRun,
  onSpeedChange,
}: VisualizerPlaybackBarProps): React.JSX.Element {
  return (
    <>
      <div
        className="visualizer-controls"
        aria-label="Playback controls"
        aria-describedby="visualizer-keyboard-help"
      >
        <button
          type="button"
          onClick={() => onRun("previous")}
          disabled={step === 0}
          className="visualizer-controls__btn"
          aria-label="Previous step"
        >
          <StepBackIcon aria-hidden="true" />
          <span>Previous</span>
        </button>
        <button
          type="button"
          onClick={() => (status === "PLAYING" ? onRun("pause") : onRun("play"))}
          className={`visualizer-controls__btn visualizer-controls__btn--play ${status === "PLAYING" ? "is-playing" : ""}`}
          aria-label={status === "PLAYING" ? "Pause execution" : "Play execution"}
        >
          {status === "PLAYING" ? (
            <>
              <PauseIcon aria-hidden="true" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <PlayIcon aria-hidden="true" />
              <span>Play</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => onRun("next")}
          disabled={!hasTrace || step >= maxStep}
          className="visualizer-controls__btn"
          aria-label="Next step"
        >
          <StepForwardIcon aria-hidden="true" />
          <span>Next</span>
        </button>
        <button
          type="button"
          onClick={() => onRun("restart")}
          className="visualizer-controls__btn"
          aria-label="Restart execution"
        >
          <RestartIcon aria-hidden="true" />
          <span>Restart</span>
        </button>
        <BookmarkButton slug={slug} stepNumber={step} />
        <label className="visualizer-speed">
          Speed
          <select value={speed} onChange={(e) => onSpeedChange(Number(e.target.value))}>
            {PLAYBACK_SPEEDS.map((value) => (
              <option key={value} value={value}>
                {value}x
              </option>
            ))}
          </select>
        </label>
      </div>
      <p id="visualizer-keyboard-help" className="visualizer-keyboard-help">
        {keyboardHint}
      </p>
    </>
  );
}

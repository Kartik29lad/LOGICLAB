"use client";

import { FocusIcon, FullscreenIcon, PresentationIcon } from "@/components/navigation/icons";

interface VisualizerModeToggleProps {
  focusMode: boolean;
  presentationMode: boolean;
  fullscreen: boolean;
  predictionMode: boolean;
  onToggleFocus: () => void;
  onEnterPresentation: () => void;
  onToggleFullscreen: () => void;
  onTogglePrediction: () => void;
}

export function VisualizerModeToggle({
  focusMode,
  presentationMode,
  fullscreen,
  predictionMode,
  onToggleFocus,
  onEnterPresentation,
  onToggleFullscreen,
  onTogglePrediction,
}: VisualizerModeToggleProps): React.JSX.Element {
  return (
    <div className="visualizer-mode-toggle">
      <button
        type="button"
        aria-pressed={focusMode}
        onClick={onToggleFocus}
        className="visualizer-mode-toggle__btn"
      >
        <FocusIcon aria-hidden="true" />
        <span>{focusMode ? "Exit Focus" : "Focus Mode"}</span>
      </button>
      <button
        type="button"
        aria-pressed={presentationMode}
        onClick={onEnterPresentation}
        className="visualizer-mode-toggle__btn"
      >
        <PresentationIcon aria-hidden="true" />
        <span>Presentation</span>
      </button>
      <button type="button" onClick={onToggleFullscreen} className="visualizer-mode-toggle__btn">
        <FullscreenIcon aria-hidden="true" />
        <span>{fullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
      </button>
      <button
        type="button"
        aria-pressed={predictionMode}
        onClick={onTogglePrediction}
        className="visualizer-mode-toggle__btn"
      >
        <span>{predictionMode ? "Exit Prediction" : "Prediction Mode"}</span>
      </button>
    </div>
  );
}

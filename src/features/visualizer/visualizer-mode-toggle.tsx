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
        <svg
          viewBox="0 0 24 24"
          width="17"
          height="17"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2.8 13.8 4l2.2-.2 1.1 1.9 2 .9-.1 2.2 1.2 1.8-1.2 1.8.1 2.2-2 .9-1.1 1.9-2.2-.2-1.8 1.2-1.8-1.2-2.2.2-1.1-1.9-2-.9.1-2.2L4 10.8l1.2-1.8-.1-2.2 2-.9 1.1-1.9 2.2.2L12 2.8Z" />
          <circle cx="12" cy="11.4" r="3" />
        </svg>
        <span>{predictionMode ? "Exit Prediction" : "Prediction Mode"}</span>
      </button>
    </div>
  );
}

"use client";

import { useEffect } from "react";

import type { PlaybackStatus } from "@/core/visualization/playback/playback-controller";

import { shouldHandleVisualizerShortcut } from "./interaction-safety";

interface UseVisualizerShortcutsProps {
  status: PlaybackStatus;
  presentationMode: boolean;
  onRun: (action: "play" | "pause" | "next" | "previous" | "restart") => void;
  onToggleFocus: () => void;
  onExitPresentation: () => void;
}

export function useVisualizerShortcuts({
  status,
  presentationMode,
  onRun,
  onToggleFocus,
  onExitPresentation,
}: UseVisualizerShortcutsProps): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!shouldHandleVisualizerShortcut(event.target)) return;
      const key = event.key.toLowerCase();
      if (key === " ") {
        event.preventDefault();
        onRun(status === "PLAYING" ? "pause" : "play");
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onRun("next");
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        onRun("previous");
      } else if (key === "r") {
        event.preventDefault();
        onRun("restart");
      } else if (key === "f") {
        event.preventDefault();
        onToggleFocus();
      } else if (event.key === "Escape" && presentationMode) {
        onExitPresentation();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [presentationMode, onRun, onToggleFocus, onExitPresentation, status]);
}

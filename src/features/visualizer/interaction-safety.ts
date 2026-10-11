const TEXT_INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

export function isTextEntryTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== "object") return false;
  if (typeof HTMLElement !== "undefined" && !(target instanceof HTMLElement)) return false;
  const el = target as { tagName?: string; isContentEditable?: boolean };
  return Boolean(el.tagName && (TEXT_INPUT_TAGS.has(el.tagName) || el.isContentEditable));
}

export function shouldHandleVisualizerShortcut(target: EventTarget | null): boolean {
  return !isTextEntryTarget(target);
}

export interface InteractionGuardResult {
  allowed: boolean;
  reason?: string;
}

export function guardPlaybackInteraction(
  action: "play" | "pause" | "next" | "previous" | "restart",
  status: string,
  traceLength: number
): InteractionGuardResult {
  if (traceLength <= 0) return { allowed: false, reason: "No execution trace is available yet." };
  if (action === "play" && status === "COMPLETED") return { allowed: true };
  if (action === "next" && status === "PLAYING")
    return { allowed: false, reason: "Pause playback before manually stepping." };
  return { allowed: true };
}

export function clampInteractionIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return Math.min(Math.max(Math.trunc(index), 0), length - 1);
}

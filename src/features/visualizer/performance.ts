export interface PerformanceBudget {
  maxRenderItems: number;
  maxTimelineMarkers: number;
}

export const VISUALIZER_PERFORMANCE_BUDGET: PerformanceBudget = {
  maxRenderItems: 500,
  maxTimelineMarkers: 180,
};

export function scheduleVisualWork(callback: () => void): () => void {
  if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
    callback();
    return () => undefined;
  }
  const frame = window.requestAnimationFrame(callback);
  return () => window.cancelAnimationFrame(frame);
}

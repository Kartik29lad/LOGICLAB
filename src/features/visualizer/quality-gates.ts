export interface AccessibilityInvariant {
  id: string;
  valid: boolean;
  message: string;
}

export function validateVisualizerAccessibility(input: {
  role?: string;
  label?: string;
  liveRegion?: boolean;
  keyboardHint?: string;
}): AccessibilityInvariant[] {
  return [
    {
      id: "region-role",
      valid: input.role === "region",
      message: "Visualizer exposes a region role.",
    },
    {
      id: "accessible-label",
      valid: Boolean(input.label?.trim()),
      message: "Visualizer has an accessible label.",
    },
    {
      id: "live-region",
      valid: input.liveRegion === true,
      message: "Execution updates have a live region.",
    },
    {
      id: "keyboard-guidance",
      valid: Boolean(input.keyboardHint?.trim()),
      message: "Keyboard guidance is available.",
    },
  ];
}

export interface ResponsiveBreakpoint {
  name: "compact" | "workspace" | "wide";
  minWidth: number;
  maxColumns: number;
}

export const VISUALIZER_RESPONSIVE_BREAKPOINTS: readonly ResponsiveBreakpoint[] = [
  { name: "compact", minWidth: 0, maxColumns: 1 },
  { name: "workspace", minWidth: 768, maxColumns: 2 },
  { name: "wide", minWidth: 1200, maxColumns: 3 },
];

export function getResponsiveProfile(width: number): ResponsiveBreakpoint {
  if (width >= 1200) return VISUALIZER_RESPONSIVE_BREAKPOINTS[2];
  if (width >= 768) return VISUALIZER_RESPONSIVE_BREAKPOINTS[1];
  return VISUALIZER_RESPONSIVE_BREAKPOINTS[0];
}

export interface PerformanceMeasurement {
  renderItems: number;
  timelineMarkers: number;
  traceSteps: number;
}

export interface PerformanceBudgetResult {
  valid: boolean;
  violations: string[];
}

export function validatePerformanceBudget(
  measurement: PerformanceMeasurement,
  budgets: { maxRenderItems: number; maxTimelineMarkers: number; maxTraceSteps: number }
): PerformanceBudgetResult {
  const violations: string[] = [];
  if (measurement.renderItems > budgets.maxRenderItems) violations.push("render-items");
  if (measurement.timelineMarkers > budgets.maxTimelineMarkers) violations.push("timeline-markers");
  if (measurement.traceSteps > budgets.maxTraceSteps) violations.push("trace-steps");
  return { valid: violations.length === 0, violations };
}

export function validateSecurityText(value: string): { valid: boolean; reason?: string } {
  const blocked = /<\/?script\b|javascript:|data:text\/html|on[a-z]+\s*=/i;
  return blocked.test(value)
    ? { valid: false, reason: "Potentially executable content is not permitted." }
    : { valid: true };
}

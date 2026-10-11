export interface WorkspaceModeState {
  focus: boolean;
  presentation: boolean;
  fullscreen: boolean;
}

export function getFocusVisibility(focus: boolean): {
  showInputs: boolean;
  showInspector: boolean;
  showMetrics: boolean;
} {
  return { showInputs: !focus, showInspector: !focus, showMetrics: !focus };
}

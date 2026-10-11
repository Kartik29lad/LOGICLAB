import { describe, expect, it } from "vitest";

import { getFocusVisibility } from "@/features/visualizer/workspace-modes";

describe("workspace modes", () => {
  it("hides secondary panels in focus mode", () => {
    expect(getFocusVisibility(true)).toEqual({
      showInputs: false,
      showInspector: false,
      showMetrics: false,
    });
  });
});

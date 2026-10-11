import { describe, expect, it } from "vitest";

import { shouldVirtualizeTrace } from "@/features/visualizer/large-trace-strategy";
import { VISUALIZER_RESOURCE_LIMITS } from "@/features/visualizer/resource-limits";
import { VISUAL_LANGUAGE } from "@/features/visualizer/visual-language";

describe("V2-66 deterministic visual regression contracts", () => {
  it("preserves the semantic visual vocabulary", () => {
    expect(Object.keys(VISUAL_LANGUAGE)).toMatchInlineSnapshot(`
      [
        "default",
        "current",
        "selected",
        "comparing",
        "swapping",
        "active",
        "visited",
        "discovered",
        "sorted",
        "target",
        "path",
        "pivot",
        "writing",
        "boundary",
        "disabled",
        "error",
        "success",
      ]
    `);
  });

  it("keeps the large-trace threshold stable", () => {
    expect(shouldVirtualizeTrace(VISUALIZER_RESOURCE_LIMITS.timelineMarkers)).toBe(false);
    expect(shouldVirtualizeTrace(VISUALIZER_RESOURCE_LIMITS.timelineMarkers + 1)).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import { getRenderer, RENDERER_REGISTRY } from "@/features/visualizer/renderer-registry";

describe("renderer registry v2", () => {
  it("registers every supported visual state renderer", () => {
    expect(Object.keys(RENDERER_REGISTRY)).toEqual(
      expect.arrayContaining([
        "array",
        "graph",
        "tree",
        "stack",
        "queue",
        "linked-list",
        "hash-table",
        "heap",
        "grid",
      ])
    );
  });
  it("returns versioned renderer metadata", () => {
    expect(getRenderer("array")?.version).toBe("2.1");
    expect(getRenderer("missing")).toBeUndefined();
  });
});

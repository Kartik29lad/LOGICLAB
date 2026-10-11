import { describe, expect, it } from "vitest";

import { LabStatePanel } from "@/components/ui/lab-state";

describe("lab state panel", () => {
  it("exposes all lifecycle states as explicit data", () => {
    for (const state of ["empty", "ready", "loading", "error", "success"] as const) {
      const element = LabStatePanel({ state, title: "Title", description: "Description" });
      expect(element.props["data-state"]).toBe(state);
    }
  });
});

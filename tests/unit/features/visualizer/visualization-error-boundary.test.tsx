import { describe, expect, it } from "vitest";

import { VisualizationErrorBoundary } from "@/features/visualizer/visualization-error-boundary";

describe("visualization error boundary", () => {
  it("exposes an isolated renderer fallback contract", () => {
    expect(VisualizationErrorBoundary).toBeDefined();
    expect(VisualizationErrorBoundary.prototype.componentDidCatch).toBeTypeOf("function");
    expect(VisualizationErrorBoundary.prototype.render).toBeTypeOf("function");
  });
});

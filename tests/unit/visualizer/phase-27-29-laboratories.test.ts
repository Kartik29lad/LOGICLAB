import { describe, expect, it } from "vitest";

import { createDemoTrace } from "@/features/visualizer/demo-traces";

describe("V2-27–29 laboratories", () => {
  it("creates hash-table execution states with buckets", async () => {
    const trace = await createDemoTrace("hash-table", {
      array: ["alpha", "beta", "gamma"] as unknown as number[],
    });
    expect(trace.steps.some((step) => step.event.type === "INSERT")).toBe(true);
    expect((trace.steps.at(-1)?.stateAfter as { buckets?: unknown[] })?.buckets).toBeDefined();
  });

  it("creates heap execution states with compare and swap events", async () => {
    const trace = await createDemoTrace("heap", { array: [7, 3, 9, 2] });
    expect(trace.steps.some((step) => step.event.type === "COMPARE")).toBe(true);
    expect(trace.steps.some((step) => step.event.type === "SWAP")).toBe(true);
    expect((trace.steps.at(-1)?.stateAfter as { items?: number[] })?.items).toBeDefined();
  });
});

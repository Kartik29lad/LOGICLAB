import { describe, expect, it } from "vitest";

import { makeArrayTrace, makeGraphTrace, makeStep } from "../../../../helpers/visualizer-fixtures";

describe("V2 testing foundation fixtures", () => {
  it("creates canonical array traces with stable indexes", () => {
    const trace = makeArrayTrace();
    expect(trace.steps).toHaveLength(4);
    expect(trace.steps[1].event.payload).toEqual({ indexes: [0, 1] });
    expect(trace.finalState).toEqual([1, 2]);
  });

  it("creates graph traces without depending on the renderer", () => {
    const trace = makeGraphTrace("bfs");
    expect(trace.algorithmSlug).toBe("bfs");
    expect(trace.steps[2].event.type).toBe("ENQUEUE");
  });

  it("keeps fixture construction explicit for isolated event tests", () => {
    const step = makeStep(
      4,
      "RELAX",
      { distance: 5 },
      { distance: 3 },
      { from: "A", to: "B", oldDistance: 5, newDistance: 3 }
    );
    expect(step.stepIndex).toBe(4);
    expect(step.event.payload).toMatchObject({ oldDistance: 5, newDistance: 3 });
  });
});

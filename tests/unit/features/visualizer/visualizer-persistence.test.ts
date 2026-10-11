import { describe, expect, it, vi } from "vitest";

import {
  buildVisualizerPersistencePayload,
  persistVisualizerRun,
} from "@/features/visualizer/visualizer-persistence";

const trace = {
  executionId: "exec-123",
  algorithmSlug: "bubble-sort",
  input: [3, 1, 2],
  output: [1, 2, 3],
  initialState: [3, 1, 2],
  steps: [],
  finalState: [1, 2, 3],
  metrics: {
    comparisons: 2,
    swaps: 1,
    reads: 0,
    writes: 0,
    visits: 0,
    iterations: 1,
    elapsedMs: 1,
  },
  status: "completed",
} as never;

describe("visualizer persistence", () => {
  it("builds a deterministic, API-compatible experiment payload", () => {
    const payload = buildVisualizerPersistencePayload(trace, "Bubble Sort", { speed: 1 });
    expect(payload.algorithmSlugs).toEqual(["bubble-sort"]);
    expect(payload.input).toEqual([3, 1, 2]);
    expect(payload.configuration).toMatchObject({ speed: 1, executionId: "exec-123" });
    expect(Number.isInteger(payload.seed)).toBe(true);
    expect(payload.seed).toBeGreaterThan(0);
  });

  it("returns the saved experiment id", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ experimentId: "exp-1", reproducible: true }), {
          status: 201,
        })
      )
    );
    await expect(
      persistVisualizerRun(
        buildVisualizerPersistencePayload(trace, "Bubble Sort"),
        "visualizer:exec-123"
      )
    ).resolves.toEqual({ experimentId: "exp-1", reproducible: true });
    vi.unstubAllGlobals();
  });

  it("converts unauthorized persistence into a useful message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 401 }))
    );
    await expect(
      persistVisualizerRun(
        buildVisualizerPersistencePayload(trace, "Bubble Sort"),
        "visualizer:exec-123"
      )
    ).rejects.toThrow("Sign in to save visualizer runs.");
    vi.unstubAllGlobals();
  });
});

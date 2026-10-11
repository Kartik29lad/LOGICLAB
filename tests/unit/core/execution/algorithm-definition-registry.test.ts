import { describe, expect, it } from "vitest";

import type { AlgorithmDefinition } from "@/contracts/execution";
import { AlgorithmDefinitionRegistry, ExecutionEngineError } from "@/core/execution";

const definition: AlgorithmDefinition<number, number, number> = {
  id: "example",
  slug: "example",
  validateInput: () => undefined,
  execute: (context) => ({
    output: context.input,
    finalState: context.input,
    trace: {
      executionId: context.executionId,
      algorithmSlug: context.algorithmSlug,
      input: context.input,
      events: [],
      metrics: {
        comparisons: 0,
        swaps: 0,
        reads: 0,
        writes: 0,
        visits: 0,
        iterations: 0,
        elapsedMs: 0,
      },
      status: "completed",
    },
  }),
};

describe("AlgorithmDefinitionRegistry", () => {
  it("registers and resolves definitions by canonical slug", () => {
    const registry = new AlgorithmDefinitionRegistry();
    registry.register(definition);
    expect(registry.has("example")).toBe(true);
    expect(registry.get<number, number, number>("example")).toBe(definition);
    expect(registry.listSlugs()).toEqual(["example"]);
  });

  it("rejects duplicate and unknown definitions", () => {
    const registry = new AlgorithmDefinitionRegistry();
    registry.register(definition);
    expect(() => registry.register(definition)).toThrow(ExecutionEngineError);
    expect(() => registry.get("missing")).toThrow(ExecutionEngineError);
  });
});

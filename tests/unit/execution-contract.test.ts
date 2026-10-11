import { describe, expect, it } from "vitest";

import type {
  AlgorithmDefinition,
  ExecutionContext,
  ExecutionController,
  ExecutionEvent,
  ExecutionLifecycleStatus,
  ExecutionResult,
  ExecutionTrace,
} from "@/contracts/execution";

interface ExampleInput {
  values: number[];
}

interface ExampleState {
  values: number[];
}

interface ExampleOutput {
  values: number[];
}

interface ExampleEventPayload {
  index: number;
}

type ExampleEvent = ExecutionEvent<ExampleEventPayload> & {
  type: "compare" | "write";
};

const definition: AlgorithmDefinition<ExampleInput, ExampleOutput, ExampleState, ExampleEvent> = {
  id: "example-algorithm",
  slug: "example-algorithm",
  validateInput(input) {
    if (input.values.length === 0) {
      throw new Error("Input must not be empty");
    }
  },
  execute(context, emit): ExecutionResult<ExampleOutput, ExampleState, ExampleEvent> {
    emit({
      stepIndex: 0,
      type: "compare",
      payload: { index: 0 },
    });

    const state = { values: [...context.input.values] };

    const trace: ExecutionTrace<ExampleInput, ExampleOutput, ExampleState, ExampleEvent> = {
      executionId: context.executionId,
      algorithmSlug: context.algorithmSlug,
      input: context.input,
      output: { values: state.values },
      initialState: { values: [...context.input.values] },
      finalState: state,
      events: [],
      metrics: {
        comparisons: 1,
        swaps: 0,
        reads: 1,
        writes: 0,
        visits: 0,
        iterations: 1,
        elapsedMs: 0,
      },
      status: "completed",
    };

    return {
      output: { values: state.values },
      finalState: state,
      trace,
    };
  },
};

const lifecycleStatuses: ExecutionLifecycleStatus[] = [
  "created",
  "validated",
  "initialized",
  "running",
  "paused",
  "completed",
  "failed",
  "cancelled",
];

const controller: ExecutionController = {
  start: async () => undefined,
  pause: () => undefined,
  resume: () => undefined,
  restart: async () => undefined,
  cancel: () => undefined,
  reset: () => undefined,
  stepForward: () => undefined,
  getStatus: () => "created",
};

const context: ExecutionContext<ExampleInput> = {
  executionId: "execution-1",
  algorithmSlug: definition.slug,
  input: { values: [3, 1, 2] },
  limits: {
    maxSteps: 100,
    maxRuntimeMs: 1_000,
  },
};

describe("Phase 2 — Execution Contracts", () => {
  it("exposes a framework-independent algorithm definition contract", async () => {
    const result = await definition.execute(context, () => undefined);

    expect(result.trace.status).toBe("completed");
    expect(result.trace.algorithmSlug).toBe("example-algorithm");
    expect(result.trace.metrics.comparisons).toBe(1);
  });

  it("defines the complete execution lifecycle vocabulary", () => {
    expect(lifecycleStatuses).toHaveLength(8);
    expect(lifecycleStatuses).toContain("running");
    expect(lifecycleStatuses).toContain("cancelled");
  });

  it("defines explicit execution controls", () => {
    expect(typeof controller.start).toBe("function");
    expect(typeof controller.pause).toBe("function");
    expect(typeof controller.resume).toBe("function");
    expect(typeof controller.restart).toBe("function");
    expect(typeof controller.cancel).toBe("function");
    expect(typeof controller.reset).toBe("function");
    expect(typeof controller.stepForward).toBe("function");
    expect(typeof controller.getStatus).toBe("function");
  });
});

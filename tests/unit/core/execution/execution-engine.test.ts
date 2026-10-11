import { describe, expect, it, vi } from "vitest";

import type { AlgorithmDefinition } from "@/contracts/execution";
import { ExecutionEngine } from "@/core/execution";
import { InputNormalizationError, InputNormalizer } from "@/core/input";
import type { NormalizedArrayInput } from "@/core/input";

const definition: AlgorithmDefinition<NormalizedArrayInput, number, NormalizedArrayInput> = {
  id: "controlled-sum",
  slug: "controlled-sum",
  validateInput: (input) => {
    if (input.kind !== "array") throw new Error("array required");
  },
  execute: async (context, emit) => {
    let total = 0;
    for (const value of context.input.values) {
      await new Promise((resolve) => setTimeout(resolve, 2));
      await context.checkpoint?.();
      context.metrics?.increment("reads");
      total += value;
      emit({ stepIndex: total, type: "READ", payload: value });
    }
    return {
      output: total,
      finalState: context.input,
      trace: {
        executionId: context.executionId,
        algorithmSlug: context.algorithmSlug,
        input: context.input,
        events: [],
        metrics: context.metrics!.snapshot(),
        status: "completed",
      },
    };
  },
};

const options = {
  executionId: "exec-1",
  algorithmSlug: "controlled-sum",
  inputKind: "array" as const,
  limits: { maxSteps: 100, maxRuntimeMs: 5_000, maxInputSize: 100, maxTraceEvents: 100 },
};

describe("ExecutionEngine", () => {
  it("normalizes input and produces a completed execution", async () => {
    const session = new ExecutionEngine().create(definition, [1, 2, 3], options);
    const started = session.controller.start();
    await started;
    const result = await session.promise;

    expect(result.output).toBe(6);
    expect(result.trace.status).toBe("completed");
    expect(result.trace.events).toHaveLength(3);
    expect(result.trace.metrics.reads).toBe(3);
    expect(session.getStatus()).toBe("completed");
  });

  it("enforces input limits before execution", () => {
    expect(() =>
      new ExecutionEngine().create(definition, [1, 2, 3], {
        ...options,
        limits: { ...options.limits, maxInputSize: 2 },
      })
    ).toThrow(InputNormalizationError);
  });

  it("enforces trace event limits", async () => {
    const session = new ExecutionEngine().create(definition, [1, 2, 3], {
      ...options,
      limits: { ...options.limits, maxTraceEvents: 2 },
    });
    await session.controller.start();
    const result = await session.promise;
    expect(result.trace.status).toBe("cancelled");
  });

  it("can pause and resume a cooperative execution", async () => {
    const session = new ExecutionEngine().create(definition, [1, 2, 3], options);
    const started = session.controller.start();
    await vi.waitFor(() => expect(session.getStatus()).toBe("running"));
    session.controller.pause();
    expect(session.getStatus()).toBe("paused");
    session.controller.resume();
    await started;
    expect((await session.promise).output).toBe(6);
  });

  it("supports single-step progression while paused", async () => {
    const session = new ExecutionEngine().create(definition, [1, 2, 3], options);
    const started = session.controller.start();
    await vi.waitFor(() => expect(session.getStatus()).toBe("running"));
    session.controller.pause();
    session.controller.stepForward();
    expect(session.getStatus()).toBe("paused");
    session.controller.resume();
    await started;
    expect((await session.promise).output).toBe(6);
  });

  it("cancels a cooperative execution and releases its wait", async () => {
    const session = new ExecutionEngine().create(definition, [1, 2, 3], options);
    const started = session.controller.start();
    await vi.waitFor(() => expect(session.getStatus()).toBe("running"));
    session.controller.pause();
    session.controller.cancel();
    await started;
    const result = await session.promise;
    expect(result.trace.status).toBe("cancelled");
    expect(session.getStatus()).toBe("cancelled");
  });

  it("makes restart create a new current execution promise and ignores stale completion", async () => {
    const session = new ExecutionEngine().create(definition, [1, 2, 3], options);
    const firstPromise = (session.controller.start(), session.promise);
    await vi.waitFor(() => expect(session.getStatus()).toBe("running"));
    const restart = session.controller.restart();
    await restart;
    const secondResult = await session.promise;
    const firstResult = await firstPromise;

    expect(firstResult.trace.status).toBe("cancelled");
    expect(secondResult.trace.status).toBe("completed");
    expect(secondResult.output).toBe(6);
    expect(session.getStatus()).toBe("completed");
  });

  it("resets without allowing the stale execution to become current", async () => {
    const session = new ExecutionEngine().create(definition, [1, 2, 3], options);
    const firstPromise = (session.controller.start(), session.promise);
    await vi.waitFor(() => expect(session.getStatus()).toBe("running"));
    session.controller.reset();
    const firstResult = await firstPromise;

    expect(firstResult.trace.status).toBe("cancelled");
    expect(session.getStatus()).toBe("created");
    await session.controller.start();
    expect((await session.promise).output).toBe(6);
  });

  it("rejects unsupported worker-memory enforcement instead of pretending to enforce it", () => {
    expect(() =>
      new ExecutionEngine().create(definition, [1], {
        ...options,
        limits: { ...options.limits, maxWorkerMemoryMb: 64 },
      })
    ).toThrow(/worker-backed execution/);
  });
});

describe("InputNormalizer", () => {
  const normalizer = new InputNormalizer({
    maxInputSize: 3,
    maxStringLength: 3,
    maxGraphNodes: 2,
    maxGraphEdges: 2,
    maxOperations: 2,
  });

  it("normalizes graph input and rejects dangling edges", () => {
    const result = normalizer.normalize("graph", {
      directed: true,
      nodes: [{ id: "a" }, { id: "b" }],
      edges: [{ source: "a", target: "b", weight: 2 }],
    });
    expect(result.kind).toBe("graph");

    expect(() =>
      normalizer.normalize("graph", {
        nodes: [{ id: "a" }],
        edges: [{ source: "a", target: "missing" }],
      })
    ).toThrow(InputNormalizationError);
  });
});

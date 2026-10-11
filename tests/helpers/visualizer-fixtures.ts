import type { CanonicalExecutionTrace, ExecutionTraceStep } from "@/contracts/events/trace-events";

export const TEST_METRICS = {
  comparisons: 0,
  swaps: 0,
  reads: 0,
  writes: 0,
  visits: 0,
  iterations: 0,
  elapsedMs: 0,
};

export function makeStep(
  stepIndex: number,
  type: ExecutionTraceStep["event"]["type"],
  stateBefore: unknown,
  stateAfter: unknown,
  payload?: Record<string, unknown>,
  extraEvent: Partial<ExecutionTraceStep["event"]> = {}
): ExecutionTraceStep {
  return {
    stepIndex,
    event: {
      stepIndex,
      type,
      payload,
      description: `${type} test event`,
      ...extraEvent,
    },
    stateBefore,
    stateAfter,
    metrics: { ...TEST_METRICS },
  } as ExecutionTraceStep;
}

export function makeTrace<TInput = unknown, TOutput = unknown, TState = unknown>(
  steps: ExecutionTraceStep[],
  input: TInput,
  output: TOutput,
  algorithmSlug = "bubble-sort"
): CanonicalExecutionTrace<TInput, TOutput, TState> {
  return {
    executionId: `fixture-${algorithmSlug}`,
    algorithmSlug,
    input,
    output,
    initialState: steps[0]?.stateBefore as TState,
    finalState: steps.at(-1)?.stateAfter as TState,
    metrics: steps.at(-1)?.metrics ?? { ...TEST_METRICS },
    status: "completed",
    steps,
  } as CanonicalExecutionTrace<TInput, TOutput, TState>;
}

export function makeArrayTrace(): CanonicalExecutionTrace<number[], number[], number[]> {
  return makeTrace<number[], number[], number[]>(
    [
      makeStep(0, "COMPARE", [2, 1], [2, 1], { indexes: [0, 1] }),
      makeStep(1, "SWAP", [2, 1], [1, 2], { indexes: [0, 1] }),
      makeStep(2, "MARK_SORTED", [1, 2], [1, 2], { indexes: [0, 1] }),
      makeStep(3, "COMPLETE", [1, 2], [1, 2]),
    ],
    [2, 1],
    [1, 2]
  );
}

export function makeGraphTrace(
  algorithmSlug = "bfs"
): CanonicalExecutionTrace<unknown, unknown, unknown> {
  const graph = {
    nodes: [
      { id: "A", label: "A", x: 80, y: 80 },
      { id: "B", label: "B", x: 240, y: 80 },
    ],
    edges: [{ source: "A", target: "B", weight: 2 }],
    directed: true,
  };
  return makeTrace(
    [
      makeStep(0, "SET_CURRENT", graph, { ...graph, current: "A" }, { node: "A" }),
      makeStep(
        1,
        "VISIT",
        { ...graph, current: "A" },
        { ...graph, current: "A", visited: ["A"] },
        { node: "A" }
      ),
      makeStep(
        2,
        "ENQUEUE",
        { ...graph, visited: ["A"] },
        { ...graph, visited: ["A"], discovered: ["A", "B"] },
        { node: "B" }
      ),
      makeStep(3, "COMPLETE", { ...graph }, { ...graph, visited: ["A", "B"] }),
    ],
    graph,
    ["A", "B"],
    algorithmSlug
  );
}

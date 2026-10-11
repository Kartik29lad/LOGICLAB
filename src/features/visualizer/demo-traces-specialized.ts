import type {
  CanonicalExecutionEvent,
  CanonicalExecutionTrace,
  ExecutionTraceStep,
  TraceMetricSnapshot,
} from "@/contracts/events/trace-events";

import type { GraphExperiment } from "./graph-editor";

export interface ArrayTraceOptions {
  array?: readonly number[];
  target?: number;
  graph?: GraphExperiment;
  tree?: import("./tree-laboratory").TreeExperiment;
}

export type TraceEvent = {
  type: CanonicalExecutionEvent["type"];
  payload?: Record<string, unknown>;
  stateAfter?: unknown;
};

export function createObserver(events: TraceEvent[]) {
  return {
    emit: (
      type: CanonicalExecutionEvent["type"],
      payload?: Record<string, unknown>,
      stateAfter?: unknown
    ) => events.push({ type, payload, stateAfter }),
  };
}

export const GRAPH_NODES: Array<[string, number, number]> = [
  ["A", 0, 0],
  ["B", 1, 0],
  ["C", 0, 1],
  ["D", 1, 1],
  ["E", 2, 1],
];
export const GRAPH_EDGES: Array<[string, string]> = [
  ["A", "B"],
  ["A", "C"],
  ["B", "D"],
  ["C", "D"],
  ["D", "E"],
];

export function emptyMetrics(): TraceMetricSnapshot {
  return { comparisons: 0, swaps: 0, reads: 0, writes: 0, visits: 0, iterations: 0, elapsedMs: 0 };
}

export function applyMetric(metrics: TraceMetricSnapshot, type: string): void {
  if (type === "COMPARE") metrics.comparisons += 1;
  if (type === "SWAP") metrics.swaps += 1;
  if (type === "READ") metrics.reads += 1;
  if (type === "WRITE") metrics.writes += 1;
  if (type === "VISIT") metrics.visits += 1;
  metrics.iterations += 1;
}

export function buildTrace(
  slug: string,
  input: unknown,
  output: unknown,
  events: TraceEvent[],
  initialState: unknown
): CanonicalExecutionTrace<unknown, unknown, unknown> {
  const eventsList = [...events];
  if (eventsList.length === 0 || eventsList[eventsList.length - 1]?.type !== "COMPLETE") {
    const lastState =
      eventsList.length > 0 && eventsList[eventsList.length - 1]?.stateAfter !== undefined
        ? eventsList[eventsList.length - 1]?.stateAfter
        : initialState;
    eventsList.push({
      type: "COMPLETE",
      payload: { finished: true },
      stateAfter: structuredClone(lastState),
    });
  }
  const metrics = emptyMetrics();
  const steps: ExecutionTraceStep<unknown>[] = [];
  let state = structuredClone(initialState);
  for (const [index, source] of eventsList.entries()) {
    applyMetric(metrics, source.type);
    const stateBefore = state;
    const stateAfter =
      source.stateAfter === undefined ? stateBefore : structuredClone(source.stateAfter);
    const snapshot = { ...metrics };
    const event = {
      stepIndex: index,
      type: source.type,
      payload: source.payload,
      stateBefore,
      stateAfter,
      metrics: snapshot,
    };
    steps.push({ stepIndex: index, event, stateBefore, stateAfter, metrics: snapshot });
    state = stateAfter;
  }
  const finalState = [
    "bfs",
    "dfs",
    "dijkstra",
    "a-star",
    "stack",
    "queue",
    "linked-list",
    "hash-table",
    "heap",
    "binary-search-tree",
  ].includes(slug)
    ? state
    : isSortOutput(output)
      ? output.sorted
      : initialState;
  return {
    executionId: `visualizer-${slug}`,
    algorithmSlug: slug,
    input,
    output,
    initialState,
    steps,
    finalState,
    metrics,
    status: "completed",
  };
}

export function isSortOutput(value: unknown): value is { sorted: number[] } {
  return (
    typeof value === "object" &&
    value !== null &&
    "sorted" in value &&
    Array.isArray((value as { sorted?: unknown }).sorted)
  );
}

export async function createLinearTrace(
  slug: string,
  options: ArrayTraceOptions = {}
): Promise<CanonicalExecutionTrace<unknown, unknown, unknown>> {
  const values = options.array && options.array.length ? [...options.array] : [10, 20, 30, 40];
  const events: TraceEvent[] = [];
  let finalState: unknown;
  let finalSize = 0;

  if (slug === "stack") {
    const state = { items: [] as number[], top: undefined as number | undefined };
    for (const value of values.slice(0, 4)) {
      state.items.push(value);
      state.top = value;
      events.push({
        type: "PUSH",
        payload: { value, position: state.items.length - 1, top: value },
        stateAfter: structuredClone(state),
      });
    }
    const popped = state.items.pop();
    state.top = state.items.at(-1);
    events.push({
      type: "POP",
      payload: { value: popped, top: state.top },
      stateAfter: structuredClone(state),
    });
    events.push({
      type: "READ",
      payload: { value: state.top, role: "top" },
      stateAfter: structuredClone(state),
    });
    finalState = state;
    finalSize = state.items.length;
  } else if (slug === "queue") {
    const state = {
      items: [] as number[],
      front: undefined as number | undefined,
      rear: undefined as number | undefined,
    };
    for (const value of values.slice(0, 4)) {
      state.items.push(value);
      state.front = state.items[0];
      state.rear = state.items.at(-1);
      events.push({
        type: "ENQUEUE",
        payload: { value, front: state.front, rear: state.rear },
        stateAfter: structuredClone(state),
      });
    }
    const dequeued = state.items.shift();
    state.front = state.items[0];
    state.rear = state.items.at(-1);
    events.push({
      type: "DEQUEUE",
      payload: { value: dequeued, front: state.front, rear: state.rear },
      stateAfter: structuredClone(state),
    });
    events.push({
      type: "READ",
      payload: { value: state.front, role: "front" },
      stateAfter: structuredClone(state),
    });
    finalState = state;
    finalSize = state.items.length;
  } else {
    const state = {
      items: [] as Array<{ id: string; value: number; nextId?: string }>,
      headId: undefined as string | undefined,
      tailId: undefined as string | undefined,
    };
    let previousId: string | undefined;
    values.slice(0, 4).forEach((value, index) => {
      const id = `node-${index + 1}`;
      const node: { id: string; value: number; nextId?: string } = { id, value };
      if (previousId) {
        const previous = state.items.find((item) => item.id === previousId);
        if (previous) previous.nextId = id;
      }
      state.items.push(node);
      if (!state.headId) state.headId = id;
      state.tailId = id;
      previousId = id;
      events.push({
        type: "INSERT",
        payload: { value, nodeId: id, headId: state.headId, tailId: state.tailId },
        stateAfter: structuredClone(state),
      });
    });
    const target = state.items[1];
    if (target)
      events.push({
        type: "VISIT",
        payload: { nodeId: target.id, value: target.value },
        stateAfter: structuredClone(state),
      });
    const removed = state.items.shift();
    state.headId = state.items[0]?.id;
    if (removed && state.items.length === 0) state.tailId = undefined;
    events.push({
      type: "REMOVE",
      payload: {
        nodeId: removed?.id,
        value: removed?.value,
        headId: state.headId,
        tailId: state.tailId,
      },
      stateAfter: structuredClone(state),
    });
    finalState = state;
    finalSize = state.items.length;
  }
  events.push({
    type: "COMPLETE",
    payload: { size: finalSize },
    stateAfter: structuredClone(finalState),
  });
  return buildTrace(
    slug,
    values,
    finalState,
    events,
    structuredClone(
      slug === "linked-list"
        ? { items: [], headId: undefined, tailId: undefined }
        : slug === "stack"
          ? { items: [], top: undefined }
          : { items: [], front: undefined, rear: undefined }
    )
  );
}

export async function createHashTableTrace(
  options: ArrayTraceOptions = {}
): Promise<CanonicalExecutionTrace<unknown, unknown, unknown>> {
  const values =
    options.array && options.array.length
      ? [...options.array]
      : ["alpha", "beta", "gamma", "delta"];
  const capacity = 8;
  const buckets = Array.from({ length: capacity }, () => [] as string[]);
  const events: TraceEvent[] = [];
  const hash = (key: string) => {
    let value = 0;
    for (const char of key) value = (value * 31 + char.charCodeAt(0)) >>> 0;
    return value % capacity;
  };
  const snapshot = () => ({ capacity, buckets: buckets.map((entries) => [...entries]) });
  for (const key of values.slice(0, 4).map(String)) {
    const index = hash(key);
    events.push({
      type: "READ",
      payload: { key, bucket: index, phase: "HASH" },
      stateAfter: snapshot(),
    });
    buckets[index]!.push(key);
    events.push({
      type: "INSERT",
      payload: { key, bucket: index, collision: buckets[index]!.length > 1 },
      stateAfter: snapshot(),
    });
  }
  const target = String(values[1] ?? "beta");
  const targetBucket = hash(target);
  events.push({
    type: "READ",
    payload: { key: target, bucket: targetBucket, phase: "LOOKUP" },
    stateAfter: snapshot(),
  });
  events.push({
    type: "REMOVE",
    payload: { key: String(values[0] ?? "alpha"), bucket: hash(String(values[0] ?? "alpha")) },
    stateAfter: snapshot(),
  });
  events.push({
    type: "COMPLETE",
    payload: { size: buckets.reduce((sum, bucket) => sum + bucket.length, 0), capacity },
    stateAfter: snapshot(),
  });
  return buildTrace("hash-table", values, { buckets }, events, {
    capacity,
    buckets: Array.from({ length: capacity }, () => []),
  });
}

export async function createHeapTrace(
  options: ArrayTraceOptions = {}
): Promise<CanonicalExecutionTrace<unknown, unknown, unknown>> {
  const values = options.array && options.array.length ? [...options.array] : [7, 3, 9, 2, 5, 8];
  const items: number[] = [];
  const events: TraceEvent[] = [];
  const snapshot = (heapBoundary = items.length) => ({ items: [...items], heapBoundary });
  const push = (value: number) => {
    items.push(value);
    events.push({
      type: "PUSH",
      payload: { value, index: items.length - 1, mode: "min" },
      stateAfter: snapshot(),
    });
    let index = items.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      events.push({
        type: "COMPARE",
        payload: { indexes: [index, parent], index, mode: "min" },
        stateAfter: snapshot(),
      });
      if (items[index]! >= items[parent]!) break;
      [items[index], items[parent]] = [items[parent]!, items[index]!];
      events.push({
        type: "SWAP",
        payload: { indexes: [index, parent], mode: "min" },
        stateAfter: snapshot(),
      });
      index = parent;
    }
  };
  for (const value of values.slice(0, 6)) push(value);
  const removed = items.shift();
  if (items.length) {
    const replacement = values[values.length - 1] ?? 0;
    items[0] = replacement;
    events.push({
      type: "POP",
      payload: { value: removed, index: 0, mode: "min" },
      stateAfter: snapshot(),
    });
    let index = 0;
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      if (left >= items.length) break;
      const child = right < items.length && items[right]! < items[left]! ? right : left;
      events.push({
        type: "COMPARE",
        payload: { indexes: [index, child], index, mode: "min" },
        stateAfter: snapshot(),
      });
      if (items[index]! <= items[child]!) break;
      [items[index], items[child]] = [items[child]!, items[index]!];
      events.push({
        type: "SWAP",
        payload: { indexes: [index, child], mode: "min" },
        stateAfter: snapshot(),
      });
      index = child;
    }
  }
  events.push({ type: "COMPLETE", payload: { mode: "min" }, stateAfter: snapshot() });
  return buildTrace("heap", values, items, events, { items: [], heapBoundary: 0 });
}

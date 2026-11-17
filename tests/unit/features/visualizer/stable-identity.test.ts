import { describe, expect, it } from "vitest";

import type {
  ArrayVisualState,
  GraphVisualState,
  HeapVisualState,
  QueueVisualState,
  StackVisualState,
  TreeVisualState,
} from "@/contracts/events/visualization-state";
import { resolveAnimationIntent } from "@/core/visualization/motion/animation-intent";
import { createDemoTrace } from "@/features/visualizer/demo-traces";
import { traceStepToVisualization } from "@/features/visualizer/render-state";
import { getGraphEdgeId } from "@/features/visualizer/renderers/graph-renderer-helpers";
import { createTreeTrace } from "@/features/visualizer/tree-laboratory";

import { makeArrayTrace, makeStep, makeTrace } from "../../../helpers/visualizer-fixtures";

describe("Phase 1 stable identity invariants", () => {
  it("resolves array targets using current logical element IDs after multiple swaps", () => {
    const trace = makeTrace<number[], number[], number[]>(
      [
        makeStep(0, "SWAP", [10, 20, 30], [20, 10, 30], { indexes: [0, 1] }),
        makeStep(1, "SWAP", [20, 10, 30], [20, 30, 10], { indexes: [1, 2] }),
        makeStep(2, "COMPARE", [20, 30, 10], [20, 30, 10], { indexes: [0, 2] }),
      ],
      [10, 20, 30],
      [10, 20, 30]
    );

    const step2Visual = traceStepToVisualization("bubble-sort", trace, trace.steps[2]!, "running")
      .visualization as ArrayVisualState;

    // After swaps (0<->1) then (1<->2): slot 0 holds "array-1" (20), slot 1 holds "array-2" (30), slot 2 holds "array-0" (10).
    expect(step2Visual.elements.map((e) => e.id)).toEqual(["array-1", "array-2", "array-0"]);

    const intent = resolveAnimationIntent(trace.steps[2]!.event, step2Visual);
    expect(intent?.targetIds).toEqual(["array-1", "array-0"]);
  });

  it("preserves logical array element IDs across insertion sort shifts", async () => {
    const trace = await createDemoTrace("insertion-sort", { array: [7, 3, 9] });
    const lastVisual = traceStepToVisualization(
      "insertion-sort",
      trace,
      trace.steps.at(-1)!,
      "completed"
    ).visualization as ArrayVisualState;

    // Original input [7, 3, 9] -> sorted [3, 7, 9], so IDs must follow values [array-1, array-0, array-2].
    expect(lastVisual.elements.map((e) => e.value)).toEqual([3, 7, 9]);
    expect(lastVisual.elements.map((e) => e.id)).toEqual(["array-1", "array-0", "array-2"]);
  });

  it("assigns distinct stable IDs for duplicate stack, queue, and heap values", async () => {
    const queueTrace = await createDemoTrace("queue", { array: [10, 10, 20, 30] });
    const afterEnqueues = traceStepToVisualization(
      "queue",
      queueTrace,
      queueTrace.steps[3]!,
      "running"
    ).visualization as QueueVisualState;
    const afterDequeue = traceStepToVisualization(
      "queue",
      queueTrace,
      queueTrace.steps[4]!,
      "running"
    ).visualization as QueueVisualState;

    expect(afterEnqueues.itemEntries?.map((e) => e.id)).toEqual([
      "queue-item-0",
      "queue-item-1",
      "queue-item-2",
      "queue-item-3",
    ]);
    // Front item (queue-item-0) leaves; survivors keep their exact IDs rather than shifting from 0.
    expect(afterDequeue.itemEntries?.map((e) => e.id)).toEqual([
      "queue-item-1",
      "queue-item-2",
      "queue-item-3",
    ]);

    const stackTrace = await createDemoTrace("stack", { array: [5, 5, 8] });
    const stackStep = traceStepToVisualization("stack", stackTrace, stackTrace.steps[2]!, "running")
      .visualization as StackVisualState;
    expect(new Set(stackStep.itemEntries?.map((e) => e.id)).size).toBe(3);

    const heapTrace = await createDemoTrace("heap", { array: [7, 3, 3, 2] });
    const heapStep = traceStepToVisualization("heap", heapTrace, heapTrace.steps[2]!, "running")
      .visualization as HeapVisualState;
    expect(new Set(heapStep.itemEntries?.map((e) => e.id)).size).toBe(heapStep.itemEntries?.length);
  });

  it("keeps tree node IDs and graph edge IDs stable across structural changes", async () => {
    const insertTrace = await createTreeTrace({
      values: [50, 30, 70],
      operation: "insert",
      target: 20,
    });
    const before = traceStepToVisualization(
      "binary-search-tree",
      insertTrace,
      insertTrace.steps[0]!,
      "running"
    ).visualization as TreeVisualState;
    const after = traceStepToVisualization(
      "binary-search-tree",
      insertTrace,
      insertTrace.steps.at(-1)!,
      "running"
    ).visualization as TreeVisualState;

    expect(Object.keys(before.nodes)).toContain("tree-node-50");
    expect(Object.keys(before.nodes)).toContain("tree-node-70");
    expect(Object.keys(after.nodes)).toContain("tree-node-70");
    expect(Object.keys(after.nodes)).toContain("tree-node-20");

    expect(getGraphEdgeId({ source: "A", target: "B" }, 0)).toBe("edge:A->B");
    expect(getGraphEdgeId({ source: "A", target: "B" }, 1)).toBe("edge:A->B#1");
    expect(makeArrayTrace().steps.length).toBeGreaterThan(0);

    const graphTrace = await createDemoTrace("bfs");
    const graphState = traceStepToVisualization("bfs", graphTrace, graphTrace.steps[1]!, "running")
      .visualization as GraphVisualState;
    expect(graphState.edges.every((edge) => typeof edge.id === "string")).toBe(true);
  });
});

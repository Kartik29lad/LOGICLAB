import { describe, expect, it } from "vitest";

import type {
  HashTableVisualState,
  HeapVisualState,
  QueueVisualState,
} from "@/contracts/events/visualization-state";
import { createAnimationIntent } from "@/core/visualization/motion/animation-intent";
import type { ElementRectSnapshot } from "@/features/visualizer/motion/element-registry";
import { GsapMotionEngine } from "@/features/visualizer/motion/gsap-motion-engine";
import {
  buildHashTableTimeline,
  buildHeapTimeline,
  buildStackQueueTimeline,
} from "@/features/visualizer/motion/presets/linear-presets";

describe("Phase 7 linear structure and heap choreography", () => {
  it("animates queue shift survivors and newly enqueued item without remounting", async () => {
    const q1 = {
      style: { willChange: "" },
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
    } as unknown as HTMLElement;
    const q2 = {
      style: { willChange: "" },
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
    } as unknown as HTMLElement;
    const elements = new Map<string, Element>([
      ["queue-item-1", q1],
      ["queue-item-2", q2],
    ]);
    const prevRects = new Map<string, ElementRectSnapshot>([
      ["queue-item-1", { id: "queue-item-1", left: 100, top: 0, width: 60, height: 40 }],
    ]);
    const nextRects = new Map<string, ElementRectSnapshot>([
      ["queue-item-1", { id: "queue-item-1", left: 20, top: 0, width: 60, height: 40 }],
      ["queue-item-2", { id: "queue-item-2", left: 100, top: 0, width: 60, height: 40 }],
    ]);
    const state: QueueVisualState = {
      type: "queue",
      stepIndex: 2,
      activeElements: [20],
      highlightedElements: [20],
      visitedNodes: [],
      queueState: [10, 20],
      stackState: [],
      metrics: {
        comparisons: 0,
        swaps: 0,
        reads: 0,
        writes: 0,
        visits: 0,
        iterations: 2,
        elapsedMs: 0,
      },
      status: "running",
      items: [10, 20],
      itemEntries: [
        { id: "queue-item-1", value: 10, state: "default" },
        { id: "queue-item-2", value: 20, state: "current" },
      ],
    };

    const engine = new GsapMotionEngine({ speed: 4 });
    const handle = buildStackQueueTimeline({
      engine,
      kind: "queue",
      intent: createAnimationIntent({ stepIndex: 2, type: "ENQUEUE" }, ["queue-item-2"]),
      state,
      prevIds: ["queue-item-1"],
      prevRects,
      nextRects,
      elements,
      generation: 1,
    });

    expect((await handle?.result)?.outcome).toBe("completed");
  });

  it("animates heap array sift exchange using stable item IDs", async () => {
    const h0 = { style: { willChange: "" }, x: 0, y: 0, zIndex: 1 } as unknown as HTMLElement;
    const h1 = { style: { willChange: "" }, x: 0, y: 0, zIndex: 1 } as unknown as HTMLElement;
    const elements = new Map<string, Element>([
      ["heap-item-0", h0],
      ["heap-item-1", h1],
    ]);
    const prevRects = new Map<string, ElementRectSnapshot>([
      ["heap-item-0", { id: "heap-item-0", left: 0, top: 0, width: 50, height: 40 }],
      ["heap-item-1", { id: "heap-item-1", left: 60, top: 0, width: 50, height: 40 }],
    ]);
    const nextRects = new Map<string, ElementRectSnapshot>([
      ["heap-item-0", { id: "heap-item-0", left: 60, top: 0, width: 50, height: 40 }],
      ["heap-item-1", { id: "heap-item-1", left: 0, top: 0, width: 50, height: 40 }],
    ]);
    const state: HeapVisualState = {
      type: "heap",
      stepIndex: 3,
      activeElements: [0],
      highlightedElements: [0, 1],
      visitedNodes: [],
      queueState: [],
      stackState: [],
      metrics: {
        comparisons: 1,
        swaps: 1,
        reads: 0,
        writes: 0,
        visits: 0,
        iterations: 3,
        elapsedMs: 0,
      },
      status: "running",
      items: [3, 7],
      itemEntries: [
        { id: "heap-item-1", value: 3 },
        { id: "heap-item-0", value: 7 },
      ],
      comparingIndexes: [0, 1],
      swappingIndexes: [0, 1],
      heapBoundary: 2,
      mode: "min",
    };

    const engine = new GsapMotionEngine({ speed: 4 });
    const handle = buildHeapTimeline({
      engine,
      intent: createAnimationIntent({ stepIndex: 3, type: "SWAP" }, ["heap-item-1", "heap-item-0"]),
      state,
      prevIds: ["heap-item-0", "heap-item-1"],
      prevRects,
      nextRects,
      elements,
      generation: 1,
    });

    expect((await handle?.result)?.outcome).toBe("completed");
  });

  it("highlights active hash bucket and entry key", async () => {
    const bucket = { style: { willChange: "" }, x: 0, scale: 1 } as unknown as HTMLElement;
    const entry = { style: { willChange: "" }, scale: 1, opacity: 1 } as unknown as HTMLElement;
    const state: HashTableVisualState = {
      type: "hash-table",
      stepIndex: 1,
      activeElements: [2],
      highlightedElements: ["alpha"],
      visitedNodes: [],
      queueState: [],
      stackState: [],
      metrics: {
        comparisons: 0,
        swaps: 0,
        reads: 0,
        writes: 1,
        visits: 0,
        iterations: 2,
        elapsedMs: 0,
      },
      status: "running",
      buckets: [{ index: 2, entries: ["alpha"], state: "active" }],
      activeBucket: 2,
      activeKey: "alpha",
    };
    const engine = new GsapMotionEngine({ speed: 4 });
    const handle = buildHashTableTimeline({
      engine,
      intent: createAnimationIntent({ stepIndex: 1, type: "INSERT" }, ["bucket-2"]),
      state,
      elements: new Map<string, Element>([
        ["bucket-2", bucket],
        ["hash-entry-2-alpha", entry],
      ]),
      generation: 1,
    });
    expect((await handle?.result)?.outcome).toBe("completed");
  });
});

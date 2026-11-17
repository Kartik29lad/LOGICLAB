"use client";

import { useRef } from "react";

import type { HeapVisualState } from "@/contracts/events/visualization-state";
import type { AnimationIntent } from "@/contracts/visualization";

import { useStepMotionLayout } from "../../motion/motion-context";
import { buildHeapTimeline } from "../../motion/presets/linear-presets";

export function HeapStructureView({
  state,
  animationIntent = null,
}: {
  state: HeapVisualState;
  animationIntent?: AnimationIntent | null;
}): React.JSX.Element {
  const entries =
    state.itemEntries ??
    state.items.map((value, index) => ({
      id: `heap-${index}`,
      value,
    }));
  const currentIds = entries.map((e) => e.id);
  const prevIdsRef = useRef<string[]>(currentIds);

  const motion = useStepMotionLayout(
    state.stepIndex,
    (committed) => {
      const prevIds = prevIdsRef.current;
      prevIdsRef.current = currentIds;
      return buildHeapTimeline({
        engine: committed.engine,
        intent: animationIntent,
        state,
        prevIds,
        prevRects: committed.prevRects,
        nextRects: committed.nextRects,
        elements: committed.registry.getAll(),
        generation: committed.generation,
      });
    },
    [animationIntent, state]
  );

  return (
    <section className="viz-linear-lab" data-motion-owned="gsap" aria-label="Heap visualization">
      <div className="viz-structure-header">
        <strong>{state.mode === "min" ? "Min Heap" : "Max Heap"}</strong>
        <span>Root = highest priority</span>
      </div>
      <div className="viz-heap-array">
        {entries.map((entry, index) => {
          const nodeState = state.swappingIndexes.includes(index)
            ? "swapping"
            : state.comparingIndexes.includes(index)
              ? "comparing"
              : index === state.activeIndex
                ? "current"
                : index >= state.heapBoundary
                  ? "disabled"
                  : "default";

          return (
            <div
              className="viz-structure-node"
              data-element-id={entry.id}
              data-state={nodeState}
              key={entry.id}
              ref={(el) => motion.registry.register(entry.id, el)}
            >
              <span>{entry.value}</span>
              <small>i={index}</small>
            </div>
          );
        })}
      </div>
      <div className="viz-legend">
        <span>parent(i)=⌊(i−1)/2⌋</span>
        <span>left=2i+1 · right=2i+2</span>
      </div>
    </section>
  );
}

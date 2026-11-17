"use client";

import * as React from "react";
import { useRef } from "react";

import type { LinkedListVisualState } from "@/contracts/events/visualization-state";
import type { AnimationIntent } from "@/contracts/visualization";

import { useStepMotionLayout } from "../../motion/motion-context";
import { buildLinkedListTimeline } from "../../motion/presets/linear-presets";

export function LinkedListStructureView({
  state,
  animationIntent = null,
}: {
  state: LinkedListVisualState;
  animationIntent?: AnimationIntent | null;
}): React.JSX.Element {
  const ids = state.items.map((i) => i.id);
  const prevIdsRef = useRef<string[]>(ids);

  const motion = useStepMotionLayout(
    state.stepIndex,
    (committed) => {
      const prevIds = prevIdsRef.current;
      prevIdsRef.current = ids;
      return buildLinkedListTimeline({
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
    <section
      className="viz-linear-lab"
      data-motion-owned="gsap"
      aria-label="Linked list visualization"
    >
      <div className="viz-structure-header">
        <strong>Singly Linked List</strong>
        <span>Each node points to the next node</span>
      </div>
      <div className="viz-linked-list">
        <span className="viz-end-label">HEAD</span>
        {state.items.map((item, i) => (
          <React.Fragment key={item.id}>
            <div
              className="viz-structure-node"
              data-element-id={item.id}
              data-state={item.state}
              ref={(el) => motion.registry.register(item.id, el)}
            >
              <span>{String(item.value)}</span>
              <small>{item.id}</small>
            </div>
            {i < state.items.length - 1 ? (
              <span
                className="viz-link-arrow"
                data-element-id={`arrow-${item.id}`}
                ref={(el) => motion.registry.register(`arrow-${item.id}`, el)}
                aria-hidden="true"
              >
                →
              </span>
            ) : (
              <span className="viz-null">null</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";

import type { QueueVisualState, StackVisualState } from "@/contracts/events/visualization-state";
import type { AnimationIntent } from "@/contracts/visualization";

import { useStepMotionLayout } from "../../motion/motion-context";
import { buildStackQueueTimeline } from "../../motion/presets/linear-presets";

export function StackStructureView({
  state,
  animationIntent = null,
}: {
  state: StackVisualState;
  animationIntent?: AnimationIntent | null;
}): React.JSX.Element {
  const entries =
    state.itemEntries ??
    state.items.map((value, i) => ({
      id: `stack-${i}`,
      value,
      state: state.activeElements.includes(value as string | number)
        ? ("current" as const)
        : ("default" as const),
    }));
  const currentIds = entries.map((e) => e.id);
  const prevIdsRef = useRef<string[]>(currentIds);

  const motion = useStepMotionLayout(
    state.stepIndex,
    (committed) => {
      const prevIds = prevIdsRef.current;
      prevIdsRef.current = currentIds;
      return buildStackQueueTimeline({
        engine: committed.engine,
        kind: "stack",
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
    <section className="viz-linear-lab" data-motion-owned="gsap" aria-label="Stack visualization">
      <div className="viz-structure-header">
        <strong>LIFO Stack</strong>
        <span>Top is the active end</span>
      </div>
      <div className="viz-stack">
        <span className="viz-end-label">TOP</span>
        {entries.map((entry, i) => (
          <div
            className="viz-structure-node"
            data-element-id={entry.id}
            data-state={entry.state ?? "default"}
            key={entry.id}
            ref={(el) => motion.registry.register(entry.id, el)}
          >
            <span>{String(entry.value)}</span>
            {i === entries.length - 1 ? <small>top</small> : null}
          </div>
        ))}
      </div>
      <div className="viz-legend">
        <span>↑ push</span>
        <span>↓ pop</span>
      </div>
    </section>
  );
}

export function QueueStructureView({
  state,
  animationIntent = null,
}: {
  state: QueueVisualState;
  animationIntent?: AnimationIntent | null;
}): React.JSX.Element {
  const entries =
    state.itemEntries ??
    state.items.map((value, i) => ({
      id: `queue-${i}`,
      value,
      state: state.activeElements.includes(value as string | number)
        ? ("current" as const)
        : ("default" as const),
    }));
  const currentIds = entries.map((e) => e.id);
  const prevIdsRef = useRef<string[]>(currentIds);

  const motion = useStepMotionLayout(
    state.stepIndex,
    (committed) => {
      const prevIds = prevIdsRef.current;
      prevIdsRef.current = currentIds;
      return buildStackQueueTimeline({
        engine: committed.engine,
        kind: "queue",
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
    <section className="viz-linear-lab" data-motion-owned="gsap" aria-label="Queue visualization">
      <div className="viz-structure-header">
        <strong>FIFO Queue</strong>
        <span>Items leave from the front</span>
      </div>
      <div className="viz-queue">
        <span className="viz-end-label">FRONT</span>
        {entries.map((entry, i) => (
          <div
            className="viz-structure-node"
            data-element-id={entry.id}
            data-state={entry.state ?? "default"}
            key={entry.id}
            ref={(el) => motion.registry.register(entry.id, el)}
          >
            <span>{String(entry.value)}</span>
            {i === entries.length - 1 ? <small>rear</small> : null}
          </div>
        ))}
      </div>
      <div className="viz-legend">
        <span>enqueue →</span>
        <span>← dequeue</span>
      </div>
    </section>
  );
}

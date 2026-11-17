"use client";

import type { HashTableVisualState } from "@/contracts/events/visualization-state";
import type { AnimationIntent } from "@/contracts/visualization";

import { useStepMotionLayout } from "../../motion/motion-context";
import { buildHashTableTimeline } from "../../motion/presets/linear-presets";

export function HashTableStructureView({
  state,
  animationIntent = null,
}: {
  state: HashTableVisualState;
  animationIntent?: AnimationIntent | null;
}): React.JSX.Element {
  const motion = useStepMotionLayout(
    state.stepIndex,
    (committed) =>
      buildHashTableTimeline({
        engine: committed.engine,
        intent: animationIntent,
        state,
        elements: committed.registry.getAll(),
        generation: committed.generation,
      }),
    [animationIntent, state]
  );

  return (
    <section
      className="viz-linear-lab"
      data-motion-owned="gsap"
      aria-label="Hash table visualization"
    >
      <div className="viz-structure-header">
        <strong>Hash Table</strong>
        <span>
          {state.activeBucket === undefined
            ? "Separate chaining"
            : `Bucket ${state.activeBucket} active`}
        </span>
      </div>
      <div className="viz-hash">
        {state.buckets.map((bucket) => {
          const bucketId = `bucket-${bucket.index}`;
          return (
            <div
              className="viz-hash-row"
              data-element-id={bucketId}
              data-state={bucket.state}
              key={bucket.index}
              ref={(el) => motion.registry.register(bucketId, el)}
            >
              <strong>{bucket.index}</strong>
              <span>
                {bucket.entries.map((entry) => {
                  const key = String(entry);
                  const entryId = `hash-entry-${bucket.index}-${key}`;
                  return (
                    <span
                      className="viz-hash-entry"
                      data-element-id={entryId}
                      data-active={entry === state.activeKey}
                      key={key}
                      ref={(el) => motion.registry.register(entryId, el)}
                    >
                      {key}
                    </span>
                  );
                })}
              </span>
            </div>
          );
        })}
      </div>
      <div className="viz-legend">
        <span>hash → bucket</span>
        <span>collision → chain</span>
      </div>
    </section>
  );
}

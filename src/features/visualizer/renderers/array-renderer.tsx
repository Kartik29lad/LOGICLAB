"use client";

import { useMemo } from "react";

import type { ArrayVisualState } from "@/contracts/events/visualization-state";
import type { AnimationIntent } from "@/contracts/visualization";

import { useStepMotionLayout } from "../motion/motion-context";
import { buildArrayStepTimeline } from "../motion/presets/array-presets";
import { ArrayCell } from "../primitives/array-cell";

export function ArrayRenderer({
  state,
  speed = 1,
  reducedMotion = false,
  animationIntent = null,
  isSearch = false,
}: {
  state: ArrayVisualState;
  speed?: number;
  reducedMotion?: boolean;
  animationIntent?: AnimationIntent | null;
  isSearch?: boolean;
}): React.JSX.Element {
  const maxValue = useMemo(
    () => Math.max(...state.elements.map((e) => Math.abs(e.value)), 1),
    [state.elements]
  );

  const motion = useStepMotionLayout(
    state.stepIndex,
    (committed) =>
      buildArrayStepTimeline({
        engine: committed.engine,
        intent: animationIntent,
        state,
        prevRects: committed.prevRects,
        nextRects: committed.nextRects,
        elements: committed.registry.getAll(),
        generation: committed.generation,
      }),
    [animationIntent, state]
  );

  return (
    <div
      className="viz-array-lab"
      data-motion-owned="gsap"
      data-animation-intent={animationIntent?.type ?? "none"}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      data-speed={speed}
      aria-label="Array visualization laboratory"
    >
      <div className="viz-array-lab__legend" aria-label="Array state legend">
        <span data-state="default">Default</span>
        <span data-state="comparing">Comparing</span>
        {isSearch ? (
          <>
            <span data-state="disabled">Eliminated</span>
            <span data-state="success">Found</span>
          </>
        ) : (
          <>
            <span data-state="swapping">Swapping</span>
            <span data-state="writing">Writing</span>
            <span data-state="pivot">Pivot</span>
            <span data-state="sorted">Sorted</span>
          </>
        )}
      </div>
      <div className="viz-array" role="list" aria-label="Array values">
        {state.elements.map((element) => (
          <div
            className="viz-array-item"
            key={element.id}
            data-element-id={element.id}
            ref={(node) => motion.registry.register(element.id, node)}
          >
            <ArrayCell
              id={element.id}
              value={element.value}
              index={element.currentIndex}
              state={element.state}
              maxValue={maxValue}
            />
          </div>
        ))}
      </div>
      <div className="viz-array-lab__pointers" aria-label="Array pointers">
        {Object.entries(state.pointers).map(([name, index]) => (
          <span key={name} data-state="current">
            <strong>{name}</strong> = {index}
          </span>
        ))}
      </div>
    </div>
  );
}

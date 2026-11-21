"use client";

import { useMemo, type CSSProperties } from "react";

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

  const legend = (
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
  );

  const searchPointers = Object.entries(state.pointers).filter(([name]) =>
    ["low", "mid", "high"].includes(name)
  );
  const showDirectionalPointers = isSearch && searchPointers.length > 0;

  return (
    <div
      className="viz-array-lab"
      data-search={isSearch ? "true" : undefined}
      data-motion-owned="gsap"
      data-animation-intent={animationIntent?.type ?? "none"}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      data-speed={speed}
      aria-label="Array visualization laboratory"
    >
      {!isSearch ? legend : null}
      <div
        className={`viz-array${showDirectionalPointers ? " viz-array--search" : ""}`}
        role="list"
        aria-label="Array values"
        style={
          showDirectionalPointers
            ? ({ "--array-count": state.elements.length } as CSSProperties)
            : undefined
        }
      >
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
      {showDirectionalPointers ? (
        <div
          className="viz-array-lab__pointer-track"
          aria-label="Binary search pointer positions"
          style={{ "--array-count": state.elements.length } as CSSProperties}
        >
          {state.elements.map((element, index) => {
            const pointersAtIndex = searchPointers.filter(
              ([, pointerIndex]) => pointerIndex === index
            );
            return (
              <div className="viz-array-lab__pointer-slot" key={element.id}>
                {pointersAtIndex.map(([name]) => (
                  <span className="viz-array-lab__pointer" data-pointer={name} key={name}>
                    <svg viewBox="0 0 16 18" aria-hidden="true">
                      <path d="M8 16V3M2.5 8.5 8 3l5.5 5.5" />
                    </svg>
                    <strong>
                      {name} = {index}
                    </strong>
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="viz-array-lab__pointers" aria-label="Array pointers">
          {Object.entries(state.pointers).map(([name, index]) => (
            <span key={name} data-state="current">
              <strong>{name}</strong> = {index}
            </span>
          ))}
        </div>
      )}
      {isSearch ? legend : null}
    </div>
  );
}

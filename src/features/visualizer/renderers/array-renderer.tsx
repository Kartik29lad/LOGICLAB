"use client";

import { useEffect, useMemo, useRef } from "react";

import type { ArrayVisualState } from "@/contracts/events/visualization-state";
import {
  MotionEngine,
  planPositionTransition,
  type AnimationIntent,
  type PositionSnapshot,
} from "@/core/visualization/motion";
import { ArrayCell } from "@/core/visualization/primitives/array-cell";

export function ArrayRenderer({
  state,
  speed = 1,
  reducedMotion = false,
  animationIntent = null,
}: {
  state: ArrayVisualState;
  speed?: number;
  reducedMotion?: boolean;
  animationIntent?: AnimationIntent | null;
}): React.JSX.Element {
  const previousPositions = useRef<PositionSnapshot[]>([]);
  const elementRefs = useRef(new Map<string, HTMLElement>());
  const motionRef = useRef<MotionEngine | null>(null);
  const previousStep = useRef(state.stepIndex);
  const maxValue = useMemo(
    () => Math.max(...state.elements.map((e) => Math.abs(e.value)), 1),
    [state.elements]
  );

  useEffect(() => {
    motionRef.current?.cancelAll();
    const currentPositions = [...elementRefs.current.entries()].map(([id, element]) => {
      const rect = element.getBoundingClientRect();
      return { id, x: rect.left, y: rect.top } satisfies PositionSnapshot;
    });

    if (
      previousPositions.current.length &&
      previousStep.current !== state.stepIndex &&
      animationIntent
    ) {
      const plan = planPositionTransition(
        animationIntent,
        previousPositions.current,
        currentPositions
      );
      motionRef.current = new MotionEngine({ speed, reducedMotion });
      motionRef.current.play(plan, elementRefs.current);
    }

    previousPositions.current = currentPositions;
    previousStep.current = state.stepIndex;
    return () => motionRef.current?.cancelAll();
  }, [animationIntent, reducedMotion, speed, state.elements, state.stepIndex]);

  return (
    <div className="viz-array-lab" aria-label="Array visualization laboratory">
      <div className="viz-array-lab__legend" aria-label="Array state legend">
        <span data-state="default">Default</span>
        <span data-state="comparing">Comparing</span>
        <span data-state="swapping">Swapping</span>
        <span data-state="writing">Writing</span>
        <span data-state="pivot">Pivot</span>
        <span data-state="sorted">Sorted</span>
      </div>
      <div className="viz-array" role="list" aria-label="Array values">
        {state.elements.map((element) => (
          <div
            className="viz-array-item"
            key={element.id}
            ref={(node) => {
              if (node) elementRefs.current.set(element.id, node);
              else elementRefs.current.delete(element.id);
            }}
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

"use client";

import type { GridVisualState } from "@/contracts/events/visualization-state";

import { useStepMotionLayout } from "../../motion/motion-context";

export function GridStructureView({ state }: { state: GridVisualState }): React.JSX.Element {
  useStepMotionLayout(state.stepIndex, () => null, [state.stepIndex]);

  return (
    <div className="viz-grid" role="img" aria-label="Grid visualization">
      {state.rows.flatMap((row, r) =>
        row.map((cell, c) => (
          <div className="viz-cell" key={`${r}-${c}`}>
            {String(cell)}
          </div>
        ))
      )}
    </div>
  );
}

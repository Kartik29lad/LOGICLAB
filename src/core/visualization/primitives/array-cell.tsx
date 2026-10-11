"use client";

import type { SemanticVisualState } from "@/contracts/events/visualization-state";

export interface ArrayCellProps {
  id: string;
  value: number;
  index: number;
  state: SemanticVisualState;
  maxValue: number;
  onSelect?: (id: string) => void;
}

export function ArrayCell({
  id,
  value,
  index,
  state,
  maxValue,
  onSelect,
}: ArrayCellProps): React.JSX.Element {
  const height = Math.max(28, (Math.abs(value) / Math.max(maxValue, 1)) * 190);
  return (
    <button
      type="button"
      className="viz-array-cell"
      data-state={state}
      data-element-id={id}
      aria-label={`Value ${value} at index ${index}, ${state} state`}
      onClick={() => onSelect?.(id)}
    >
      <span className="viz-array-cell__bar" style={{ height: `${height}px` }}>
        <span className="viz-array-cell__value">{value}</span>
      </span>
      <span className="viz-array-cell__index">{index}</span>
    </button>
  );
}

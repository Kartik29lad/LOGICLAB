"use client";

import type { GraphVisualState } from "@/contracts/events/visualization-state";

import type { PositionedGraphNode } from "./graph-edge-layer";
import { formatScore, STATE_LABELS } from "./graph-renderer-helpers";

interface GraphNodeLayerProps {
  positions: readonly PositionedGraphNode[];
  state: GraphVisualState;
  editable: boolean;
  isAStar: boolean;
  onStartDrag: (nodeId: string, event: React.PointerEvent<SVGGElement>) => void;
  registerNodeRef?: (id: string, element: SVGGElement | null) => void;
}

export function GraphNodeLayer({
  positions,
  state,
  editable,
  isAStar,
  onStartDrag,
  registerNodeRef,
}: GraphNodeLayerProps): React.JSX.Element {
  return (
    <g className="viz-graph-nodes">
      {positions.map((node) => {
        const stateLabel = STATE_LABELS[node.state];
        const distance = state.distances[node.id];

        return (
          <g
            key={node.id}
            ref={(el) => registerNodeRef?.(node.id, el)}
            className="viz-graph-node"
            data-node-id={node.id}
            data-state={node.state}
            data-editable={editable ? "true" : "false"}
            tabIndex={0}
            onPointerDown={(event) => onStartDrag(node.id, event)}
            aria-label={`${node.label} graph node${editable ? ". Drag to reposition." : ""}`}
          >
            <circle
              className="viz-graph-node-halo"
              cx={node.x}
              cy={node.y}
              r="31"
              aria-hidden="true"
            />
            <circle className="viz-graph-node-circle" cx={node.x} cy={node.y} r="26" />
            <text className="viz-graph-node-label" x={node.x} y={node.y + 5} textAnchor="middle">
              {node.label}
            </text>
            {isAStar ? (
              <g className="viz-graph-score-badges">
                <rect x={node.x + 22} y={node.y - 58} width="82" height="42" rx="10" />
                <text x={node.x + 63} y={node.y - 44} textAnchor="middle">
                  g {formatScore(distance)}
                </text>
                <text x={node.x + 63} y={node.y - 31} textAnchor="middle">
                  h {formatScore(node.heuristic)}
                </text>
                <text x={node.x + 63} y={node.y - 18} textAnchor="middle">
                  f {formatScore(node.fScore)}
                </text>
              </g>
            ) : distance !== undefined ? (
              <g className="viz-graph-distance">
                <rect x={node.x + 19} y={node.y - 43} width="46" height="20" rx="10" />
                <text x={node.x + 42} y={node.y - 29} textAnchor="middle">
                  {Number.isFinite(distance) ? distance : "∞"}
                </text>
              </g>
            ) : null}
            {state.parents[node.id] ? (
              <text className="viz-graph-parent" x={node.x} y={node.y + 45} textAnchor="middle">
                ← {state.parents[node.id]}
              </text>
            ) : null}
            {stateLabel ? (
              <text
                className="viz-graph-state-label"
                x={node.x}
                y={node.y - 38}
                textAnchor="middle"
              >
                {stateLabel}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

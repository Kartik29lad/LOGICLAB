"use client";

import type { GraphVisualState } from "@/contracts/events/visualization-state";

import { computeEdgeGeometry, getGraphEdgeId, type GraphPoint } from "./graph-renderer-helpers";

export type PositionedGraphNode = GraphVisualState["nodes"][number] & GraphPoint;

interface GraphEdgeLayerProps {
  edges: GraphVisualState["edges"];
  byId: ReadonlyMap<string, PositionedGraphNode>;
  directed: boolean;
  markerId: string;
  registerEdgeRef?: (id: string, element: SVGPathElement | null) => void;
}

export function GraphEdgeLayer({
  edges,
  byId,
  directed,
  markerId,
  registerEdgeRef,
}: GraphEdgeLayerProps): React.JSX.Element {
  const seenPairs = new Map<string, number>();

  return (
    <g className="viz-graph-edges">
      {edges.map((edge) => {
        const source = byId.get(edge.source);
        const target = byId.get(edge.target);
        if (!source || !target) return null;

        const pairKey = `${edge.source}->${edge.target}`;
        const occurrence = seenPairs.get(pairKey) ?? 0;
        seenPairs.set(pairKey, occurrence + 1);
        const edgeKey = getGraphEdgeId(edge, occurrence);
        const geometry = computeEdgeGeometry(source, target);

        return (
          <g key={edgeKey} className="viz-graph-edge" data-state={edge.state}>
            <path
              ref={(node) => registerEdgeRef?.(edgeKey, node)}
              className="viz-graph-edge-line"
              d={geometry.pathData}
              fill="none"
              data-edge-id={edgeKey}
              data-state={edge.state}
              markerEnd={directed ? `url(#${markerId})` : undefined}
            />
            {edge.weight !== undefined && edge.weight !== 1 ? (
              <text
                className="viz-graph-edge-weight"
                x={(geometry.x1 + geometry.x2) / 2}
                y={(geometry.y1 + geometry.y2) / 2 - 8}
                textAnchor="middle"
              >
                {edge.weight}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

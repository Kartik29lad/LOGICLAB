"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import type { GraphVisualState } from "@/contracts/events/visualization-state";
import type { AnimationIntent } from "@/contracts/visualization";

import { useStepMotionLayout } from "../motion/motion-context";
import { buildGraphStepTimeline } from "../motion/presets/graph-presets";
import { GraphEdgeLayer } from "./graph-edge-layer";
import { GraphInspectors } from "./graph-inspectors";
import { GraphNodeLayer } from "./graph-node-layer";
import {
  bfsPhaseLabel,
  describeGraphState,
  dfsPhaseLabel,
  layoutNodes,
} from "./graph-renderer-helpers";

interface GraphEditorOptions {
  enabled?: boolean;
  onNodeMove?: (nodeId: string, x: number, y: number) => void;
}

export function GraphRenderer({
  state,
  editor,
  animationIntent = null,
  reducedMotion,
}: {
  state: GraphVisualState;
  editor?: GraphEditorOptions;
  animationIntent?: AnimationIntent | null;
  reducedMotion?: boolean;
}): React.JSX.Element {
  const basePositions = useMemo(() => layoutNodes(state.nodes), [state.nodes]);
  const [positions, setPositions] = useState(basePositions);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const instanceId = useId().replace(/:/g, "");
  useEffect(() => setPositions(basePositions), [basePositions]);
  const byId = useMemo(() => new Map(positions.map((node) => [node.id, node])), [positions]);
  const markerId = `graph-arrow-${instanceId}`;
  const editable = Boolean(editor?.enabled);

  const motion = useStepMotionLayout(
    state.stepIndex,
    (committed) =>
      buildGraphStepTimeline({
        engine: committed.engine,
        intent: animationIntent,
        state,
        elements: committed.registry.getAll(),
        generation: committed.generation,
      }),
    [animationIntent, state]
  );

  const moveNode = (event: React.PointerEvent<SVGSVGElement>): void => {
    if (!draggingId || !editable || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(34, Math.min(726, ((event.clientX - rect.left) / rect.width) * 760));
    const y = Math.max(34, Math.min(396, ((event.clientY - rect.top) / rect.height) * 430));
    setPositions((current) =>
      current.map((node) => (node.id === draggingId ? { ...node, x, y } : node))
    );
  };

  const finishMove = (): void => {
    if (!draggingId) return;
    const moved = positions.find((node) => node.id === draggingId);
    if (moved) editor?.onNodeMove?.(draggingId, moved.x, moved.y);
    setDraggingId(null);
  };

  const handleStartDrag = (nodeId: string, event: React.PointerEvent<SVGGElement>): void => {
    if (!editable) return;
    event.stopPropagation();
    setDraggingId(nodeId);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const isBfs = state.algorithmMode === "bfs";
  const isDfs = state.algorithmMode === "dfs";
  const isAStar = state.algorithmMode === "a-star";

  return (
    <div
      className="viz-graph-lab"
      data-motion-owned="gsap"
      data-animation-intent={animationIntent?.type ?? "none"}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      role="img"
      aria-label="Interactive graph visualization"
    >
      <div className="viz-graph-toolbar" aria-live="polite">
        <span className="viz-graph-operation">{describeGraphState(state)}</span>
        <span className="viz-graph-step">Step {state.stepIndex + 1}</span>
        {isBfs ? (
          <span className="viz-graph-phase" data-phase={state.algorithmPhase}>
            {bfsPhaseLabel(state.algorithmPhase)}
          </span>
        ) : null}
        {isDfs ? (
          <span className="viz-graph-phase" data-phase={state.algorithmPhase}>
            {dfsPhaseLabel(state.algorithmPhase)}
          </span>
        ) : null}
        {isAStar ? <span className="viz-graph-phase">f = g + h</span> : null}
      </div>

      <div className="viz-graph-canvas">
        <svg
          ref={svgRef}
          viewBox="0 0 760 430"
          preserveAspectRatio="xMidYMid meet"
          aria-label={
            editable
              ? "Editable graph canvas. Drag nodes to reposition them."
              : "Graph visualization"
          }
          role={editable ? "application" : undefined}
          onPointerMove={moveNode}
          onPointerUp={finishMove}
          onPointerCancel={finishMove}
          onPointerLeave={finishMove}
        >
          <defs>
            <marker
              id={markerId}
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
            </marker>
          </defs>

          <GraphEdgeLayer
            edges={state.edges}
            byId={byId}
            directed={state.directed}
            markerId={markerId}
            registerEdgeRef={(id, el) => motion.registry.register(id, el)}
          />
          <GraphNodeLayer
            positions={positions}
            state={state}
            editable={editable}
            isAStar={isAStar}
            onStartDrag={handleStartDrag}
            registerNodeRef={(id, el) => motion.registry.register(id, el)}
          />
          <circle
            ref={(el) => motion.registry.register("graph-tracer", el)}
            className="viz-graph-tracer"
            r="6"
            cx="0"
            cy="0"
            opacity="0"
            aria-hidden="true"
          />
        </svg>
      </div>

      <GraphInspectors state={state} />
    </div>
  );
}

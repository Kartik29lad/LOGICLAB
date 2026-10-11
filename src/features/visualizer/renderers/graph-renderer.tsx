"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { GraphVisualState } from "@/contracts/events/visualization-state";

import {
  bfsPhaseLabel,
  describeGraphState,
  dfsPhaseLabel,
  formatScore,
  layoutNodes,
  STATE_LABELS,
} from "./graph-renderer-helpers";

interface GraphEditorOptions {
  enabled?: boolean;
  onNodeMove?: (nodeId: string, x: number, y: number) => void;
}

export function GraphRenderer({
  state,
  editor,
  animationIntent,
  reducedMotion,
}: {
  state: GraphVisualState;
  editor?: GraphEditorOptions;
  animationIntent?: { type?: string } | null;
  reducedMotion?: boolean;
}): React.JSX.Element {
  const basePositions = useMemo(() => layoutNodes(state.nodes), [state.nodes]);
  const [positions, setPositions] = useState(basePositions);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  useEffect(() => setPositions(basePositions), [basePositions]);
  const byId = new Map(positions.map((node) => [node.id, node]));
  const markerId = `graph-arrow-${state.stepIndex}`;
  const editable = Boolean(editor?.enabled);

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

  const isBfs = state.algorithmMode === "bfs";
  const isDfs = state.algorithmMode === "dfs";
  const isAStar = state.algorithmMode === "a-star";

  return (
    <div
      className="viz-graph-lab"
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

          <g className="viz-graph-edges">
            {state.edges.map((edge, index) => {
              const source = byId.get(edge.source);
              const target = byId.get(edge.target);
              if (!source || !target) return null;
              const edgeKey = `${edge.source}-${edge.target}-${index}`;
              const dx = target.x - source.x;
              const dy = target.y - source.y;
              const length = Math.max(Math.hypot(dx, dy), 1);
              const offsetX = (dx / length) * 26;
              const offsetY = (dy / length) * 26;
              const x1 = source.x + offsetX;
              const y1 = source.y + offsetY;
              const x2 = target.x - offsetX;
              const y2 = target.y - offsetY;
              const directed = state.directed;

              return (
                <g key={edgeKey} className="viz-graph-edge" data-state={edge.state}>
                  <line
                    className="viz-graph-edge-line"
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    data-state={edge.state}
                    markerEnd={directed ? `url(#${markerId})` : undefined}
                  />
                  {edge.weight !== undefined && edge.weight !== 1 ? (
                    <text
                      className="viz-graph-edge-weight"
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 8}
                      textAnchor="middle"
                    >
                      {edge.weight}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </g>

          <g className="viz-graph-nodes">
            {positions.map((node) => {
              const stateLabel = STATE_LABELS[node.state];
              const distance = state.distances[node.id];
              return (
                <g
                  key={node.id}
                  className="viz-graph-node"
                  data-state={node.state}
                  data-editable={editable ? "true" : "false"}
                  tabIndex={0}
                  onPointerDown={(event) => {
                    if (!editable) return;
                    event.stopPropagation();
                    setDraggingId(node.id);
                    event.currentTarget.setPointerCapture?.(event.pointerId);
                  }}
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
                  <text
                    className="viz-graph-node-label"
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                  >
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
                    <text
                      className="viz-graph-parent"
                      x={node.x}
                      y={node.y + 45}
                      textAnchor="middle"
                    >
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
        </svg>
      </div>

      {isAStar ? (
        <aside className="viz-astar-inspector" aria-label="A star execution state">
          <div className="viz-astar-inspector__header">
            <strong>A* State</strong>
            <span>f = g + h</span>
          </div>
          <div className="viz-astar-sets">
            <div>
              <b>Open set</b>
              <span>{state.openSet?.join(", ") || "empty"}</span>
            </div>
            <div>
              <b>Closed set</b>
              <span>{state.closedSet?.join(", ") || "empty"}</span>
            </div>
          </div>
          <div className="viz-astar-facts">
            <span>
              <strong>Current</strong>
              {state.currentNode ?? "—"}
            </span>
            <span>
              <strong>Target</strong>
              {state.targetNode ?? "—"}
            </span>
            <span>
              <strong>Path</strong>
              {state.path.join(" → ") || "—"}
            </span>
            <span>
              <strong>Edge</strong>
              {state.currentEdge
                ? `${state.currentEdge.source} → ${state.currentEdge.target}`
                : "—"}
            </span>
          </div>
        </aside>
      ) : null}
      {isBfs ? (
        <aside className="viz-bfs-inspector" aria-label="Breadth-first search state">
          <div className="viz-bfs-inspector__header">
            <strong>BFS State</strong>
            <span>Level-order exploration</span>
          </div>
          <div className="viz-bfs-queue" aria-label="BFS queue">
            <span>Queue</span>
            <div>
              {state.queueState.length > 0 ? (
                state.queueState.map((node) => (
                  <span className="viz-bfs-queue__item" key={node}>
                    {node}
                  </span>
                ))
              ) : (
                <em>empty</em>
              )}
            </div>
          </div>
          <div className="viz-bfs-facts">
            <span>
              <strong>Discovered</strong>
              {state.discoveredNodes.join(", ") || "—"}
            </span>
            <span>
              <strong>Visited order</strong>
              {state.traversalOrder.join(" → ") || "—"}
            </span>
            <span>
              <strong>Current edge</strong>
              {state.currentEdge
                ? `${state.currentEdge.source} → ${state.currentEdge.target}`
                : "—"}
            </span>
          </div>
          <div className="viz-bfs-levels" aria-label="BFS levels">
            {Object.entries(state.distances)
              .sort(([, a], [, b]) => a - b)
              .map(([node, level]) => (
                <span key={node}>
                  <b>{node}</b>
                  <small>L{level}</small>
                </span>
              ))}
          </div>
        </aside>
      ) : null}

      {isDfs ? (
        <aside className="viz-dfs-inspector" aria-label="Depth-first search state">
          <div className="viz-dfs-inspector__header">
            <strong>DFS State</strong>
            <span>Depth-first exploration</span>
          </div>
          <div className="viz-dfs-stack" aria-label="DFS recursion stack">
            <span>Recursion Stack</span>
            <div>
              {state.stackState.length > 0 ? (
                state.stackState.map((node, index) => (
                  <span className="viz-dfs-stack__item" key={`${node}-${index}`}>
                    <small>{index + 1}</small>
                    {node}
                  </span>
                ))
              ) : (
                <em>empty</em>
              )}
            </div>
          </div>
          <div className="viz-dfs-facts">
            <span>
              <strong>Current path</strong>
              {state.currentPath.join(" → ") || "—"}
            </span>
            <span>
              <strong>Traversal order</strong>
              {state.traversalOrder.join(" → ") || "—"}
            </span>
            <span>
              <strong>Current edge</strong>
              {state.currentEdge
                ? `${state.currentEdge.source} → ${state.currentEdge.target}`
                : "—"}
            </span>
          </div>
          {state.algorithmPhase === "backtrack" ? (
            <div className="viz-dfs-backtrack" role="status">
              Backtracking from{" "}
              <strong>{state.currentEdge?.source ?? state.currentNode ?? "node"}</strong>
              {state.currentEdge?.target ? (
                <>
                  {" "}
                  to <strong>{state.currentEdge.target}</strong>
                </>
              ) : null}
            </div>
          ) : null}
        </aside>
      ) : null}

      <div className="viz-graph-legend" aria-label="Graph state legend">
        {Object.entries(STATE_LABELS).map(([stateName, label]) => (
          <span key={stateName} data-state={stateName}>
            <i aria-hidden="true" /> {label}
          </span>
        ))}
      </div>
      {Object.keys(state.distances).length > 0 ? (
        <div className="viz-graph-distances" aria-label="Graph distances">
          {Object.entries(state.distances).map(([nodeId, distance]) => (
            <span key={nodeId}>
              <strong>{nodeId}</strong> {Number.isFinite(distance) ? distance : "∞"}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

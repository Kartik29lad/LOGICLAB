"use client";

import type { GraphVisualState } from "@/contracts/events/visualization-state";

import { STATE_LABELS } from "./graph-renderer-helpers";

export function GraphInspectors({ state }: { state: GraphVisualState }): React.JSX.Element {
  const isBfs = state.algorithmMode === "bfs";
  const isDfs = state.algorithmMode === "dfs";
  const isAStar = state.algorithmMode === "a-star";

  return (
    <>
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
    </>
  );
}

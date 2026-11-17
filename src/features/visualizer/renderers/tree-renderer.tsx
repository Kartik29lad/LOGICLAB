"use client";

import { useMemo, useRef } from "react";

import type { TreeVisualState } from "@/contracts/events/visualization-state";
import type { AnimationIntent } from "@/contracts/visualization";

import { useStepMotionLayout } from "../motion/motion-context";
import { buildTreeStepTimeline, type PositionedTreeNode } from "../motion/presets/tree-presets";

type Positioned = TreeVisualState["nodes"][string] & PositionedTreeNode;

export function TreeRenderer({
  state,
  animationIntent = null,
  reducedMotion = false,
}: {
  state: TreeVisualState;
  animationIntent?: AnimationIntent | null;
  reducedMotion?: boolean;
}): React.JSX.Element {
  const positions = useMemo(() => layoutTree(state), [state]);
  const byId = useMemo(() => new Map(positions.map((node) => [node.id, node])), [positions]);
  const prevPositionsRef = useRef<Positioned[]>(positions);

  const motion = useStepMotionLayout(
    state.stepIndex,
    (committed) => {
      const prev = prevPositionsRef.current;
      prevPositionsRef.current = positions;
      return buildTreeStepTimeline({
        engine: committed.engine,
        intent: animationIntent,
        prevNodes: prev,
        nextNodes: positions,
        elements: committed.registry.getAll(),
        generation: committed.generation,
      });
    },
    [animationIntent, positions, state.stepIndex]
  );

  return (
    <div
      className="viz-tree-lab"
      data-motion-owned="gsap"
      data-animation-intent={animationIntent?.type ?? "none"}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      role="img"
      aria-label="Interactive binary tree visualization"
    >
      <div className="viz-tree-toolbar">
        <strong>
          {state.currentNode
            ? `Current: ${state.nodes[state.currentNode]?.value ?? state.currentNode}`
            : "Tree structure"}
        </strong>
        <span>{Object.keys(state.nodes).length} nodes</span>
        <span>Step {state.stepIndex + 1}</span>
      </div>
      <svg
        className="viz-tree-canvas"
        viewBox="0 0 900 500"
        preserveAspectRatio="xMidYMid meet"
        aria-label="Binary search tree hierarchy"
      >
        <g className="viz-tree-edges">
          {positions.flatMap((node) =>
            [node.leftId, node.rightId].map((childId) => {
              const child = childId ? byId.get(childId) : undefined;
              const edgeId = child ? `tree-edge:${node.id}->${child.id}` : "";
              return child ? (
                <line
                  key={edgeId}
                  ref={(el) => motion.registry.register(edgeId, el)}
                  data-edge-id={edgeId}
                  x1={node.x}
                  y1={node.y + 25}
                  x2={child.x}
                  y2={child.y - 25}
                />
              ) : null;
            })
          )}
        </g>
        <g className="viz-tree-nodes">
          {positions.map((node) => (
            <g
              key={node.id}
              ref={(el) => motion.registry.register(node.id, el)}
              data-node-id={node.id}
              className="viz-tree-node"
              data-state={node.state}
              transform={`translate(${node.x} ${node.y})`}
            >
              <circle r="26" />
              <text y="5" textAnchor="middle">
                {node.value}
              </text>
              <title>{`Node ${node.value}`}</title>
            </g>
          ))}
        </g>
      </svg>
      <div className="viz-tree-legend">
        <span>
          <i data-state="current" />
          Current
        </span>
        <span>
          <i data-state="visited" />
          Visited
        </span>
        <span>
          <i data-state="success" />
          Found
        </span>
        <span>
          <i data-state="default" />
          Structure
        </span>
      </div>
    </div>
  );
}

export function layoutTree(state: TreeVisualState): Positioned[] {
  if (!state.rootId) return [];
  const levels = new Map<string, number>();
  const order: string[] = [];
  const walk = (id: string | undefined, depth: number): void => {
    if (!id) return;
    const node = state.nodes[id];
    if (!node) return;
    levels.set(id, depth);
    walk(node.leftId, depth + 1);
    order.push(id);
    walk(node.rightId, depth + 1);
  };
  walk(state.rootId, 0);
  const maxDepth = Math.max(0, ...levels.values());
  const positions: Positioned[] = [];
  order.forEach((id, index) => {
    const node = state.nodes[id]!;
    const depth = levels.get(id) ?? 0;
    positions.push({
      ...node,
      x: ((index + 1) / (order.length + 1)) * 900,
      y: 70 + depth * (390 / Math.max(1, maxDepth || 1)),
    });
  });
  return positions;
}

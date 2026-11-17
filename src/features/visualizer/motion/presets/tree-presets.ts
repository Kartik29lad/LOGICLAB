import type { MotionPoint } from "@/contracts/visualization";
import { MOTION_TIMING_TOKENS, type AnimationIntent } from "@/contracts/visualization";

import type { GsapMotionEngine } from "../gsap-motion-engine";

export interface PositionedTreeNode {
  readonly id: string;
  readonly leftId?: string;
  readonly rightId?: string;
  readonly x: number;
  readonly y: number;
}

export interface TreeEdgeLink {
  readonly edgeId: string;
  readonly parentId: string;
  readonly childId: string;
}

export interface TreeNodeMove {
  readonly id: string;
  readonly from: MotionPoint;
  readonly to: MotionPoint;
}

export function computeTreeNodeMoves(
  prevNodes: readonly PositionedTreeNode[],
  nextNodes: readonly PositionedTreeNode[]
): {
  moves: TreeNodeMove[];
  insertedIds: string[];
} {
  const prevById = new Map(prevNodes.map((n) => [n.id, n]));
  const moves: TreeNodeMove[] = [];
  const insertedIds: string[] = [];

  for (const next of nextNodes) {
    const prev = prevById.get(next.id);
    if (!prev) {
      if (prevNodes.length > 0) insertedIds.push(next.id);
      moves.push({ id: next.id, from: { x: next.x, y: next.y }, to: { x: next.x, y: next.y } });
      continue;
    }
    moves.push({
      id: next.id,
      from: { x: prev.x, y: prev.y },
      to: { x: next.x, y: next.y },
    });
  }

  return { moves, insertedIds };
}

export function collectTreeEdges(nodes: readonly PositionedTreeNode[]): TreeEdgeLink[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const links: TreeEdgeLink[] = [];
  for (const node of nodes) {
    for (const childId of [node.leftId, node.rightId]) {
      if (childId && byId.has(childId)) {
        links.push({ edgeId: `tree-edge:${node.id}->${childId}`, parentId: node.id, childId });
      }
    }
  }
  return links;
}

export function buildTreeStepTimeline(options: {
  engine: GsapMotionEngine;
  intent: AnimationIntent | null;
  prevNodes: readonly PositionedTreeNode[];
  nextNodes: readonly PositionedTreeNode[];
  elements: ReadonlyMap<string, Element>;
  generation: number;
}) {
  const { engine, intent, prevNodes, nextNodes, elements, generation } = options;
  const { moves, insertedIds } = computeTreeNodeMoves(prevNodes, nextNodes);
  const edges = collectTreeEdges(nextNodes);
  const hasGeometryChange =
    insertedIds.length > 0 ||
    moves.some((m) => Math.abs(m.from.x - m.to.x) > 0.5 || Math.abs(m.from.y - m.to.y) > 0.5);

  const targets: Element[] = [];
  for (const node of nextNodes) {
    const el = elements.get(node.id);
    if (el) targets.push(el);
  }
  for (const edge of edges) {
    const el = elements.get(edge.edgeId);
    if (el) targets.push(el);
  }

  if (targets.length === 0) return null;

  const activeTargets = (intent?.targetIds ?? [])
    .map((id) => elements.get(id))
    .filter((el): el is Element => Boolean(el));

  if (!hasGeometryChange && activeTargets.length === 0) return null;

  const moveById = new Map(moves.map((m) => [m.id, m]));

  const applyInterpolatedState = (t: number): void => {
    const currentPos = new Map<string, MotionPoint>();
    for (const node of nextNodes) {
      const move = moveById.get(node.id);
      const x = move ? move.from.x + (move.to.x - move.from.x) * t : node.x;
      const y = move ? move.from.y + (move.to.y - move.from.y) * t : node.y;
      currentPos.set(node.id, { x, y });
      const nodeEl = elements.get(node.id);
      nodeEl?.setAttribute?.("transform", `translate(${x} ${y})`);
    }

    for (const edge of edges) {
      const parent = currentPos.get(edge.parentId);
      const child = currentPos.get(edge.childId);
      const edgeEl = elements.get(edge.edgeId);
      if (!parent || !child || !edgeEl) continue;
      edgeEl.setAttribute?.("x1", String(parent.x));
      edgeEl.setAttribute?.("y1", String(parent.y + 25));
      edgeEl.setAttribute?.("x2", String(child.x));
      edgeEl.setAttribute?.("y2", String(child.y - 25));
    }
  };

  return engine.runTimeline(
    (tl) => {
      if (hasGeometryChange) {
        const proxy = { t: 0 };
        applyInterpolatedState(0);
        tl.to(
          proxy,
          {
            t: 1,
            duration: MOTION_TIMING_TOKENS.structuralMs / 1000,
            ease: "power3.inOut",
            onUpdate: () => applyInterpolatedState(proxy.t),
          },
          0
        );
      }

      if (insertedIds.length > 0) {
        const insertedEls = insertedIds
          .map((id) => elements.get(id))
          .filter((el): el is Element => Boolean(el));
        if (insertedEls.length > 0) {
          tl.fromTo(
            insertedEls,
            { opacity: 0, scale: 0.45, transformOrigin: "center center" },
            {
              opacity: 1,
              scale: 1,
              duration: MOTION_TIMING_TOKENS.traverseMs / 1000,
              ease: "back.out(1.4)",
              transformOrigin: "center center",
            },
            0
          );
        }
      } else if (activeTargets.length > 0) {
        const dur =
          (intent?.type === "FOUND"
            ? MOTION_TIMING_TOKENS.swapMs
            : MOTION_TIMING_TOKENS.compareMs) / 1000;
        tl.fromTo(
          activeTargets,
          { scale: 1, transformOrigin: "center center" },
          {
            scale: intent?.type === "FOUND" ? 1.15 : 1.09,
            duration: dur * 0.5,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
            transformOrigin: "center center",
          },
          0
        );
      }
    },
    targets,
    {
      scope: "tree",
      renderer: "tree",
      operation: intent?.type ?? "COMPARE",
      generation,
      clearProps: "opacity,scale,willChange",
      onSettle: () => applyInterpolatedState(1),
    }
  );
}

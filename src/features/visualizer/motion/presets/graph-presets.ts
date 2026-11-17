import type { GraphVisualState } from "@/contracts/events/visualization-state";
import { MOTION_TIMING_TOKENS, type AnimationIntent } from "@/contracts/visualization";

import type { GsapMotionEngine } from "../gsap-motion-engine";
import { defaultSvgGeometryAdapter, type SvgGeometryPort } from "../svg-geometry-adapter";

export function findGraphEdgeTarget(
  state: GraphVisualState,
  elements: ReadonlyMap<string, Element>
): { edgeEl: SVGElement; reversed: boolean } | null {
  if (!state.currentEdge) return null;
  const { source, target } = state.currentEdge;
  const forwardId = `edge:${source}->${target}`;
  const forwardEl = elements.get(forwardId);
  if (forwardEl) return { edgeEl: forwardEl as SVGElement, reversed: false };

  const reverseId = `edge:${target}->${source}`;
  const reverseEl = elements.get(reverseId);
  if (reverseEl) return { edgeEl: reverseEl as SVGElement, reversed: true };

  return null;
}

export function buildGraphStepTimeline(options: {
  engine: GsapMotionEngine;
  intent: AnimationIntent | null;
  state: GraphVisualState;
  elements: ReadonlyMap<string, Element>;
  generation: number;
  geometry?: SvgGeometryPort;
}) {
  const {
    engine,
    intent,
    state,
    elements,
    generation,
    geometry = defaultSvgGeometryAdapter,
  } = options;

  const edgeMatch = findGraphEdgeTarget(state, elements);
  const tracerEl = elements.get("graph-tracer") as SVGElement | undefined;
  const currentNodeEl = state.currentNode ? elements.get(state.currentNode) : undefined;
  const targetNodeEl = state.currentEdge ? elements.get(state.currentEdge.target) : currentNodeEl;

  const targets: Element[] = [];
  if (edgeMatch) targets.push(edgeMatch.edgeEl);
  if (tracerEl) targets.push(tracerEl);
  if (currentNodeEl) targets.push(currentNodeEl);
  if (targetNodeEl && targetNodeEl !== currentNodeEl) targets.push(targetNodeEl);

  if (targets.length === 0) return null;

  const isBacktrack = state.algorithmPhase === "backtrack";
  const isPath = state.path.length > 1 && (intent?.type === "PATH" || intent?.type === "SORTED");
  const traverseSec = MOTION_TIMING_TOKENS.traverseMs / 1000;
  const relaxSec = MOTION_TIMING_TOKENS.relaxMs / 1000;

  return engine.runTimeline(
    (tl) => {
      if (edgeMatch) {
        const totalLength = Math.max(geometry.getTotalLength(edgeMatch.edgeEl), 1);
        const startOffset = edgeMatch.reversed ? -totalLength : totalLength;
        const startDist = edgeMatch.reversed ? totalLength : 0;
        const endDist = edgeMatch.reversed ? 0 : totalLength;

        if (typeof edgeMatch.edgeEl.setAttribute === "function" && !isBacktrack) {
          tl.fromTo(
            edgeMatch.edgeEl,
            { strokeDasharray: `${totalLength} ${totalLength}`, strokeDashoffset: startOffset },
            { strokeDashoffset: 0, duration: traverseSec, ease: "power2.inOut" },
            0
          );
        }

        if (tracerEl) {
          const proxy = { d: startDist };
          const startPoint = geometry.getPointAtLength(edgeMatch.edgeEl, startDist);
          tl.call(
            () => {
              tracerEl.setAttribute?.("cx", String(startPoint.x));
              tracerEl.setAttribute?.("cy", String(startPoint.y));
              tracerEl.setAttribute?.("opacity", "1");
            },
            undefined,
            0
          );
          tl.to(
            proxy,
            {
              d: endDist,
              duration: traverseSec,
              ease: "power2.inOut",
              onUpdate: () => {
                const pt = geometry.getPointAtLength(edgeMatch.edgeEl, proxy.d);
                tracerEl.setAttribute?.("cx", String(pt.x));
                tracerEl.setAttribute?.("cy", String(pt.y));
              },
            },
            0
          );
          tl.to(tracerEl, { opacity: 0, duration: 0.08, ease: "power1.out" }, traverseSec * 0.9);
        }
      }

      if (targetNodeEl) {
        const at = edgeMatch ? traverseSec * 0.72 : 0;
        tl.fromTo(
          targetNodeEl,
          { scale: 0.94, transformOrigin: "center center" },
          {
            scale: 1.08,
            duration: relaxSec * 0.55,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
            transformOrigin: "center center",
          },
          at
        );
      }

      if (isPath) {
        const pathEls = state.path
          .map((id) => elements.get(id))
          .filter((el): el is Element => Boolean(el));
        if (pathEls.length > 0) {
          tl.fromTo(
            pathEls,
            { scale: 0.96, transformOrigin: "center center" },
            {
              scale: 1.07,
              duration: 0.16,
              stagger: 0.045,
              yoyo: true,
              repeat: 1,
              ease: "power2.out",
              transformOrigin: "center center",
            },
            edgeMatch ? traverseSec * 0.85 : 0
          );
        }
      }
    },
    targets,
    {
      scope: "graph",
      renderer: "graph",
      operation: intent?.type ?? "TRAVERSE",
      generation,
      clearProps: "transform,opacity,scale,willChange,strokeDasharray,strokeDashoffset",
      onSettle: () => {
        if (tracerEl) {
          tracerEl.setAttribute?.("opacity", "0");
        }
      },
    }
  );
}

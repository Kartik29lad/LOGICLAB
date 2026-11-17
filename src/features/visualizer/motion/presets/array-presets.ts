import type { ArrayVisualState } from "@/contracts/events/visualization-state";
import { MOTION_TIMING_TOKENS, type AnimationIntent } from "@/contracts/visualization";

import type { ElementRectSnapshot } from "../element-registry";
import type { GsapMotionEngine } from "../gsap-motion-engine";
import { addFlipArcTweens } from "./shared-presets";

export interface FlipDelta {
  readonly id: string;
  readonly dx: number;
  readonly dy: number;
}

export interface SwapArcProfile {
  readonly id: string;
  readonly dx: number;
  readonly dy: number;
  readonly peakYOffset: number;
}

export function computeFlipDeltas(
  ids: readonly string[],
  prevRects: ReadonlyMap<string, ElementRectSnapshot>,
  nextRects: ReadonlyMap<string, ElementRectSnapshot>
): FlipDelta[] {
  const deltas: FlipDelta[] = [];
  for (const id of ids) {
    const prev = prevRects.get(id);
    const next = nextRects.get(id);
    if (!prev || !next) continue;
    const dx = prev.left - next.left;
    const dy = prev.top - next.top;
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      deltas.push({ id, dx, dy });
    }
  }
  return deltas;
}

export function computeSwapArcProfiles(
  deltas: readonly FlipDelta[],
  baseArcHeight = 26
): SwapArcProfile[] {
  if (deltas.length === 2) {
    const [first, second] = deltas as [FlipDelta, FlipDelta];
    // Separate vertical arcs by travel direction so moving elements never overlap at midpoint.
    const firstGoesRight = first.dx < 0;
    const amplitude = Math.min(40, Math.max(18, baseArcHeight));
    return [
      { ...first, peakYOffset: firstGoesRight ? -amplitude : amplitude * 0.7 },
      { ...second, peakYOffset: firstGoesRight ? amplitude * 0.7 : -amplitude },
    ];
  }

  return deltas.map((delta, index) => ({
    ...delta,
    peakYOffset: index % 2 === 0 ? -Math.round(baseArcHeight * 0.6) : 0,
  }));
}

export function buildArrayStepTimeline(options: {
  engine: GsapMotionEngine;
  intent: AnimationIntent | null;
  state: ArrayVisualState;
  prevRects: ReadonlyMap<string, ElementRectSnapshot>;
  nextRects: ReadonlyMap<string, ElementRectSnapshot>;
  elements: ReadonlyMap<string, Element>;
  generation: number;
}) {
  const { engine, intent, state, prevRects, nextRects, elements, generation } = options;
  const allIds = state.elements.map((el) => el.id);
  const allTargets = allIds
    .map((id) => elements.get(id))
    .filter((el): el is Element => Boolean(el));

  if (allTargets.length === 0) return null;

  const deltas = computeFlipDeltas(allIds, prevRects, nextRects);
  const intentTargets = (intent?.targetIds ?? [])
    .map((id) => elements.get(id))
    .filter((el): el is Element => Boolean(el));

  if (deltas.length === 0 && intentTargets.length === 0 && intent?.type !== "SORTED") {
    return null;
  }

  const intentType = intent?.type ?? "COMPARE";

  return engine.runTimeline(
    (tl) => {
      if (deltas.length > 0) {
        const arcs = computeSwapArcProfiles(deltas);
        addFlipArcTweens(tl, arcs, elements, MOTION_TIMING_TOKENS.swapMs / 1000);
        return;
      }

      if (intentType === "COMPARE") {
        const dur = MOTION_TIMING_TOKENS.compareMs / 1000;
        tl.to(intentTargets, {
          y: -8,
          scale: 1.05,
          duration: dur * 0.5,
          ease: "power2.out",
          yoyo: true,
          repeat: 1,
        });
      } else if (intentType === "WRITE" || intentType === "SELECT" || intentType === "PIVOT") {
        const dur = MOTION_TIMING_TOKENS.fastMs / 1000;
        tl.fromTo(
          intentTargets,
          { scale: 0.94, y: 0 },
          { scale: 1.06, y: -5, duration: dur * 0.5, ease: "power2.out", yoyo: true, repeat: 1 }
        );
      } else if (intentType === "FOUND") {
        const dur = MOTION_TIMING_TOKENS.swapMs / 1000;
        tl.fromTo(
          intentTargets,
          { scale: 1, y: 0 },
          { scale: 1.1, y: -10, duration: dur * 0.45, ease: "back.out(1.6)", yoyo: true, repeat: 1 }
        );
      } else if (intentType === "NOT_FOUND") {
        const dur = MOTION_TIMING_TOKENS.compareMs / 1000;
        const targets = intentTargets.length > 0 ? intentTargets : allTargets;
        tl.to(targets, {
          x: -5,
          duration: dur * 0.25,
          ease: "power1.inOut",
          yoyo: true,
          repeat: 3,
        });
      } else if (intentType === "SORTED") {
        const targets = intentTargets.length > 0 ? intentTargets : allTargets;
        const dur = MOTION_TIMING_TOKENS.settleMs / 1000;
        const stagger = targets.length > 1 ? Math.min(0.035, 0.2 / targets.length) : 0;
        tl.fromTo(
          targets,
          { y: -4, scale: 1.03 },
          { y: 0, scale: 1, duration: dur, stagger, ease: "power2.out" }
        );
      } else if (intentType === "BOUNDARY") {
        const dur = MOTION_TIMING_TOKENS.fastMs / 1000;
        const targets = intentTargets.length > 0 ? intentTargets : allTargets;
        tl.fromTo(
          targets,
          { scale: 0.96, opacity: 0.85 },
          { scale: 1, opacity: 1, duration: dur, ease: "power2.out" }
        );
      }
    },
    allTargets,
    {
      scope: "array",
      renderer: "array",
      operation: intentType,
      generation,
    }
  );
}

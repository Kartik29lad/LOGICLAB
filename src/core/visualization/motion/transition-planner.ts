import type { AnimationIntent, TransitionOperation, TransitionPlan } from "./types";

export interface PositionSnapshot {
  id: string;
  x: number;
  y: number;
}

export function planPositionTransition(
  intent: AnimationIntent,
  before: readonly PositionSnapshot[],
  after: readonly PositionSnapshot[]
): TransitionPlan {
  const previous = new Map(before.map((item) => [item.id, item]));
  const next = new Map(after.map((item) => [item.id, item]));
  const operations: TransitionOperation[] = [];

  for (const id of intent.targetIds) {
    const from = previous.get(id);
    const to = next.get(id);
    if (!from || !to) continue;
    const dx = from.x - to.x;
    const dy = from.y - to.y;
    if (dx === 0 && dy === 0) continue;
    operations.push({
      id: `${intent.id}-${id}-position`,
      targetId: id,
      property: "transform",
      from: `translate3d(${dx}px, ${dy}px, 0)`,
      to: "translate3d(0, 0, 0)",
      durationMs: intent.durationMs,
      easing: intent.easing,
      intentId: intent.id,
    });
  }

  return {
    intentId: intent.id,
    execution: intent.execution,
    operations,
    durationMs: intent.durationMs,
    interruptible: intent.interruptible,
    reducedMotion: intent.reducedMotion,
  };
}

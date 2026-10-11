import type { CanonicalExecutionEvent, ExecutionEventType } from "@/contracts/events/trace-events";

import type { AnimationIntent, AnimationIntentType } from "./types";

const DURATIONS: Record<AnimationIntentType, number> = {
  COMPARE: 160,
  SWAP: 360,
  WRITE: 240,
  SELECT: 180,
  SORTED: 220,
  PIVOT: 220,
  BOUNDARY: 180,
  ACTIVE_RANGE: 180,
  VISIT: 210,
  DISCOVER: 230,
  TRAVERSE: 260,
  RELAX: 300,
  FOUND: 420,
  PATH: 340,
  INSERT: 300,
  DELETE: 260,
  ROTATE: 340,
};

const EVENT_TO_INTENT: Partial<Record<ExecutionEventType, AnimationIntentType>> = {
  START: "SELECT",
  COMPARE: "COMPARE",
  SWAP: "SWAP",
  WRITE: "WRITE",
  READ: "SELECT",
  INSERT: "INSERT",
  REMOVE: "DELETE",
  VISIT: "VISIT",
  ENQUEUE: "DISCOVER",
  DEQUEUE: "TRAVERSE",
  PUSH: "INSERT",
  POP: "DELETE",
  RELAX: "RELAX",
  SET_CURRENT: "SELECT",
  FOUND: "FOUND",
  NOT_FOUND: "DELETE",
  PARTITION: "BOUNDARY",
  MERGE: "WRITE",
  ROTATE: "ROTATE",
  MARK_SORTED: "SORTED",
  SELECT: "SELECT",
  PIVOT: "PIVOT",
  BACKTRACK: "TRAVERSE",
  COMPLETE: "SORTED",
};

export function resolveAnimationIntent(event: CanonicalExecutionEvent): AnimationIntent | null {
  const type = EVENT_TO_INTENT[event.type];
  if (!type) return null;

  const targetIds = resolveTargetIds(event);
  return createAnimationIntent(event, targetIds, {
    execution: type === "SWAP" || type === "PATH" ? "parallel" : "serial",
  });
}

export function resolveTargetIds(event: CanonicalExecutionEvent): string[] {
  const ids = new Set<string>();
  for (const reference of event.references ?? []) ids.add(String(reference.id));

  const payload = isRecord(event.payload) ? event.payload : undefined;
  const indexes = payload?.indexes;
  if (Array.isArray(indexes)) {
    for (const index of indexes) {
      if (typeof index === "number" || typeof index === "string") ids.add(`array-${index}`);
    }
  }
  if (typeof payload?.index === "number" || typeof payload?.index === "string")
    ids.add(`array-${payload.index}`);
  if (typeof payload?.node === "string") ids.add(payload.node);
  if (Array.isArray(payload?.nodes)) {
    for (const node of payload.nodes) if (typeof node === "string") ids.add(node);
  }
  if (Array.isArray(payload?.path)) {
    for (const node of payload.path) if (typeof node === "string") ids.add(node);
  }

  return [...ids];
}

export function createAnimationIntent(
  event: CanonicalExecutionEvent,
  targetIds: readonly string[],
  options: Partial<
    Pick<AnimationIntent, "durationMs" | "easing" | "execution" | "interruptible" | "reducedMotion">
  > = {}
): AnimationIntent | null {
  const type = EVENT_TO_INTENT[event.type];
  if (!type) return null;
  return {
    id: `intent-${event.stepIndex}-${type.toLowerCase()}`,
    type,
    targetIds: [...new Set(targetIds)],
    durationMs: options.durationMs ?? DURATIONS[type],
    easing: options.easing ?? "ease-in-out",
    execution: options.execution ?? (type === "SWAP" ? "parallel" : "serial"),
    interruptible: options.interruptible ?? true,
    reducedMotion: options.reducedMotion ?? "settle",
    metadata: {
      eventType: event.type,
      payload: event.payload ?? null,
      semanticTargets: [...new Set(targetIds)],
    },
  };
}

export function animationDuration(type: AnimationIntentType): number {
  return DURATIONS[type];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

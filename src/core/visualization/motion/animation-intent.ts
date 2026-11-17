import type { CanonicalExecutionEvent, ExecutionEventType } from "@/contracts/events/trace-events";
import type { VisualStateSnapshot } from "@/contracts/events/visualization-state";
import {
  MOTION_TIMING_TOKENS,
  type AnimationIntent,
  type AnimationIntentType,
} from "@/contracts/visualization/motion-contracts";

const DURATIONS: Record<AnimationIntentType, number> = {
  COMPARE: MOTION_TIMING_TOKENS.compareMs,
  SWAP: MOTION_TIMING_TOKENS.swapMs,
  WRITE: MOTION_TIMING_TOKENS.fastMs,
  SELECT: MOTION_TIMING_TOKENS.fastMs,
  SORTED: MOTION_TIMING_TOKENS.settleMs,
  PIVOT: MOTION_TIMING_TOKENS.compareMs,
  BOUNDARY: MOTION_TIMING_TOKENS.fastMs,
  ACTIVE_RANGE: MOTION_TIMING_TOKENS.fastMs,
  VISIT: MOTION_TIMING_TOKENS.traverseMs,
  DISCOVER: MOTION_TIMING_TOKENS.compareMs,
  TRAVERSE: MOTION_TIMING_TOKENS.traverseMs,
  RELAX: MOTION_TIMING_TOKENS.relaxMs,
  FOUND: MOTION_TIMING_TOKENS.swapMs,
  NOT_FOUND: MOTION_TIMING_TOKENS.compareMs,
  PATH: MOTION_TIMING_TOKENS.traverseMs,
  INSERT: MOTION_TIMING_TOKENS.traverseMs,
  DELETE: MOTION_TIMING_TOKENS.compareMs,
  ROTATE: MOTION_TIMING_TOKENS.structuralMs,
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
  NOT_FOUND: "NOT_FOUND",
  PARTITION: "BOUNDARY",
  MERGE: "WRITE",
  ROTATE: "ROTATE",
  MARK_SORTED: "SORTED",
  SELECT: "SELECT",
  PIVOT: "PIVOT",
  BACKTRACK: "TRAVERSE",
  COMPLETE: "SORTED",
};

export function resolveAnimationIntent(
  event: CanonicalExecutionEvent,
  visualState?: VisualStateSnapshot | null
): AnimationIntent | null {
  const type = EVENT_TO_INTENT[event.type];
  if (!type) return null;

  const targetIds = resolveTargetIds(event, visualState);
  return createAnimationIntent(event, targetIds, {
    execution: type === "SWAP" || type === "PATH" ? "parallel" : "serial",
  });
}

export function resolveTargetIds(
  event: CanonicalExecutionEvent,
  visualState?: VisualStateSnapshot | null
): string[] {
  const ids = new Set<string>();
  for (const reference of event.references ?? []) ids.add(String(reference.id));

  const payload = isRecord(event.payload) ? event.payload : undefined;

  if (visualState?.type === "array") {
    addSlotIds(ids, payload, (slot) => visualState.elements[slot]?.id ?? `array-${slot}`);
    if (typeof payload?.mid === "number") {
      ids.add(visualState.elements[payload.mid]?.id ?? `array-${payload.mid}`);
    }
  } else if (visualState?.type === "heap") {
    addSlotIds(ids, payload, (slot) => visualState.itemEntries?.[slot]?.id ?? `heap-${slot}`);
  } else if (visualState?.type === "tree") {
    for (const candidate of [payload?.value, payload?.current, payload?.target, payload?.node]) {
      if (typeof candidate === "number" || typeof candidate === "string") {
        const key = `tree-node-${candidate}`;
        if (visualState.nodes[key]) ids.add(key);
        else if (visualState.nodes[String(candidate)]) ids.add(String(candidate));
      }
    }
  } else if (visualState?.type === "graph") {
    if (visualState.currentEdge) {
      ids.add(`edge:${visualState.currentEdge.source}->${visualState.currentEdge.target}`);
      ids.add(visualState.currentEdge.source);
      ids.add(visualState.currentEdge.target);
    }
    if (typeof payload?.from === "string" && typeof payload?.to === "string") {
      ids.add(`edge:${payload.from}->${payload.to}`);
      ids.add(payload.from);
      ids.add(payload.to);
    }
  } else if (visualState?.type === "hash-table") {
    if (typeof payload?.bucket === "number") ids.add(`bucket-${payload.bucket}`);
    if (typeof payload?.bucket === "number" && typeof payload?.key === "string") {
      ids.add(`hash-entry-${payload.bucket}-${payload.key}`);
    }
  } else if (visualState?.type === "linked-list") {
    if (typeof payload?.nodeId === "string") ids.add(payload.nodeId);
  } else {
    addSlotIds(ids, payload, (slot) => `array-${slot}`);
  }

  if (typeof payload?.node === "string") ids.add(payload.node);
  if (typeof payload?.nodeId === "string") ids.add(payload.nodeId);
  if (Array.isArray(payload?.nodes)) {
    for (const node of payload.nodes) if (typeof node === "string") ids.add(node);
  }
  if (Array.isArray(payload?.path)) {
    for (const node of payload.path) if (typeof node === "string") ids.add(node);
  }

  return [...ids];
}

function addSlotIds(
  ids: Set<string>,
  payload: Record<string, unknown> | undefined,
  resolveSlot: (slot: number) => string
): void {
  const indexes = payload?.indexes;
  if (Array.isArray(indexes)) {
    for (const index of indexes) {
      if (typeof index === "number") ids.add(resolveSlot(index));
      else if (typeof index === "string") ids.add(`array-${index}`);
    }
  }
  if (typeof payload?.index === "number") ids.add(resolveSlot(payload.index));
  else if (typeof payload?.index === "string") ids.add(`array-${payload.index}`);
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

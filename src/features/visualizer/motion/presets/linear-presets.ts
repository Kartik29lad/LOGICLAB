import type {
  HashTableVisualState,
  HeapVisualState,
  LinkedListVisualState,
  QueueVisualState,
  StackVisualState,
} from "@/contracts/events/visualization-state";
import { MOTION_TIMING_TOKENS, type AnimationIntent } from "@/contracts/visualization";

import type { ElementRectSnapshot } from "../element-registry";
import type { GsapMotionEngine } from "../gsap-motion-engine";
import { computeFlipDeltas, computeSwapArcProfiles } from "./array-presets";
import { addFlipArcTweens } from "./shared-presets";

export function buildStackQueueTimeline(options: {
  engine: GsapMotionEngine;
  kind: "stack" | "queue";
  intent: AnimationIntent | null;
  state: StackVisualState | QueueVisualState;
  prevIds: readonly string[];
  prevRects: ReadonlyMap<string, ElementRectSnapshot>;
  nextRects: ReadonlyMap<string, ElementRectSnapshot>;
  elements: ReadonlyMap<string, Element>;
  generation: number;
}) {
  const { engine, kind, intent, state, prevIds, prevRects, nextRects, elements, generation } =
    options;
  const entries =
    state.itemEntries ?? state.items.map((value, i) => ({ id: `${kind}-${i}`, value }));
  const currentIds = entries.map((e) => e.id);
  const targets = currentIds
    .map((id) => elements.get(id))
    .filter((el): el is Element => Boolean(el));

  if (targets.length === 0) return null;

  const prevSet = new Set(prevIds);
  const enteredEls = currentIds
    .filter((id) => !prevSet.has(id))
    .map((id) => elements.get(id))
    .filter((el): el is Element => Boolean(el));

  const deltas = computeFlipDeltas(currentIds, prevRects, nextRects);

  if (enteredEls.length === 0 && deltas.length === 0 && intent?.type === "SORTED") {
    return engine.runTimeline(
      (tl) => {
        tl.fromTo(
          targets,
          { scale: 1.03 },
          {
            scale: 1,
            duration: MOTION_TIMING_TOKENS.settleMs / 1000,
            stagger: 0.03,
            ease: "power2.out",
          }
        );
      },
      targets,
      { scope: kind, renderer: kind, operation: "COMPLETE", generation }
    );
  }

  if (enteredEls.length === 0 && deltas.length === 0) {
    const activeEls = targets.filter((_, idx) =>
      kind === "stack" ? idx === targets.length - 1 : idx === 0
    );
    if (activeEls.length === 0) return null;
    return engine.runTimeline(
      (tl) => {
        tl.to(activeEls, {
          scale: 1.06,
          y: -4,
          duration: MOTION_TIMING_TOKENS.fastMs / 2000,
          yoyo: true,
          repeat: 1,
          ease: "power2.out",
        });
      },
      targets,
      { scope: kind, renderer: kind, operation: intent?.type ?? "SELECT", generation }
    );
  }

  const dur = MOTION_TIMING_TOKENS.traverseMs / 1000;
  return engine.runTimeline(
    (tl) => {
      for (const [index, delta] of deltas.entries()) {
        const el = elements.get(delta.id);
        if (!el) continue;
        tl.fromTo(
          el,
          { x: delta.dx, y: delta.dy },
          { x: 0, y: 0, duration: dur, ease: "power2.out" },
          Math.min(0.12, index * 0.025)
        );
      }

      if (enteredEls.length > 0) {
        const entryOffset = kind === "stack" ? { y: -26, x: 0 } : { x: 28, y: 0 };
        tl.fromTo(
          enteredEls,
          { ...entryOffset, opacity: 0, scale: 0.92 },
          { x: 0, y: 0, opacity: 1, scale: 1, duration: dur, ease: "back.out(1.2)" },
          0
        );
      }
    },
    targets,
    { scope: kind, renderer: kind, operation: intent?.type ?? "INSERT", generation }
  );
}

export function buildLinkedListTimeline(options: {
  engine: GsapMotionEngine;
  intent: AnimationIntent | null;
  state: LinkedListVisualState;
  prevIds: readonly string[];
  prevRects: ReadonlyMap<string, ElementRectSnapshot>;
  nextRects: ReadonlyMap<string, ElementRectSnapshot>;
  elements: ReadonlyMap<string, Element>;
  generation: number;
}) {
  const { engine, intent, state, prevIds, prevRects, nextRects, elements, generation } = options;
  const ids = state.items.map((item) => item.id);
  const targets = ids
    .flatMap((id) => [elements.get(id), elements.get(`arrow-${id}`)])
    .filter((el): el is Element => Boolean(el));

  if (targets.length === 0) return null;

  const prevSet = new Set(prevIds);
  const enteredEls = ids
    .filter((id) => !prevSet.has(id))
    .flatMap((id) => [elements.get(id), elements.get(`arrow-${id}`)])
    .filter((el): el is Element => Boolean(el));
  const deltas = computeFlipDeltas(ids, prevRects, nextRects);

  const activeEls = state.items
    .filter((item) => item.state === "current")
    .flatMap((item) => [elements.get(item.id), elements.get(`arrow-${item.id}`)])
    .filter((el): el is Element => Boolean(el));

  if (enteredEls.length === 0 && deltas.length === 0 && activeEls.length === 0) return null;

  const dur = MOTION_TIMING_TOKENS.traverseMs / 1000;
  return engine.runTimeline(
    (tl) => {
      for (const delta of deltas) {
        const el = elements.get(delta.id);
        if (!el) continue;
        tl.fromTo(
          el,
          { x: delta.dx, y: delta.dy },
          { x: 0, y: 0, duration: dur, ease: "power2.out" },
          0
        );
      }
      if (enteredEls.length > 0) {
        tl.fromTo(
          enteredEls,
          { y: -18, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: dur, ease: "back.out(1.2)" },
          0
        );
      } else if (activeEls.length > 0) {
        tl.to(activeEls, {
          scale: 1.07,
          duration: MOTION_TIMING_TOKENS.compareMs / 2 / 1000,
          yoyo: true,
          repeat: 1,
          ease: "power2.out",
        });
      }
    },
    targets,
    {
      scope: "linked-list",
      renderer: "linked-list",
      operation: intent?.type ?? "VISIT",
      generation,
    }
  );
}

export function buildHashTableTimeline(options: {
  engine: GsapMotionEngine;
  intent: AnimationIntent | null;
  state: HashTableVisualState;
  elements: ReadonlyMap<string, Element>;
  generation: number;
}) {
  const { engine, intent, state, elements, generation } = options;
  const targets: Element[] = [];
  const bucketEl =
    state.activeBucket !== undefined ? elements.get(`bucket-${state.activeBucket}`) : undefined;
  if (bucketEl) targets.push(bucketEl);

  const entryEl =
    state.activeBucket !== undefined && state.activeKey
      ? elements.get(`hash-entry-${state.activeBucket}-${state.activeKey}`)
      : undefined;
  if (entryEl) targets.push(entryEl);

  if (targets.length === 0) return null;

  const dur = MOTION_TIMING_TOKENS.compareMs / 1000;
  return engine.runTimeline(
    (tl) => {
      if (bucketEl) {
        tl.fromTo(
          bucketEl,
          { x: -6, scale: 0.99 },
          { x: 0, scale: 1.02, duration: dur * 0.55, yoyo: true, repeat: 1, ease: "power2.out" },
          0
        );
      }
      if (entryEl) {
        tl.fromTo(
          entryEl,
          { scale: 0.9, opacity: 0.7 },
          {
            scale: 1.08,
            opacity: 1,
            duration: dur * 0.6,
            yoyo: true,
            repeat: 1,
            ease: "back.out(1.4)",
          },
          0.04
        );
      }
    },
    targets,
    { scope: "hash-table", renderer: "hash-table", operation: intent?.type ?? "INSERT", generation }
  );
}

export function buildHeapTimeline(options: {
  engine: GsapMotionEngine;
  intent: AnimationIntent | null;
  state: HeapVisualState;
  prevIds: readonly string[];
  prevRects: ReadonlyMap<string, ElementRectSnapshot>;
  nextRects: ReadonlyMap<string, ElementRectSnapshot>;
  elements: ReadonlyMap<string, Element>;
  generation: number;
}) {
  const { engine, intent, state, prevIds, prevRects, nextRects, elements, generation } = options;
  const entries =
    state.itemEntries ?? state.items.map((value, idx) => ({ id: `heap-${idx}`, value }));
  const ids = entries.map((e) => e.id);
  const targets = ids.map((id) => elements.get(id)).filter((el): el is Element => Boolean(el));

  if (targets.length === 0) return null;

  const prevSet = new Set(prevIds);
  const enteredEls = ids
    .filter((id) => !prevSet.has(id))
    .map((id) => elements.get(id))
    .filter((el): el is Element => Boolean(el));
  const deltas = computeFlipDeltas(ids, prevRects, nextRects);

  const compareEls = state.comparingIndexes
    .map((idx) => entries[idx]?.id)
    .filter((id): id is string => Boolean(id))
    .map((id) => elements.get(id))
    .filter((el): el is Element => Boolean(el));

  if (deltas.length === 0 && enteredEls.length === 0 && compareEls.length === 0) return null;

  return engine.runTimeline(
    (tl) => {
      if (deltas.length > 0) {
        const arcs = computeSwapArcProfiles(deltas, 22);
        addFlipArcTweens(tl, arcs, elements, MOTION_TIMING_TOKENS.swapMs / 1000);
        return;
      }

      if (enteredEls.length > 0) {
        tl.fromTo(
          enteredEls,
          { y: -18, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: MOTION_TIMING_TOKENS.traverseMs / 1000,
            ease: "back.out(1.2)",
          },
          0
        );
      } else if (compareEls.length > 0) {
        tl.to(compareEls, {
          y: -6,
          scale: 1.05,
          duration: MOTION_TIMING_TOKENS.compareMs / 2 / 1000,
          yoyo: true,
          repeat: 1,
          ease: "power2.out",
        });
      }
    },
    targets,
    { scope: "heap", renderer: "heap", operation: intent?.type ?? "COMPARE", generation }
  );
}

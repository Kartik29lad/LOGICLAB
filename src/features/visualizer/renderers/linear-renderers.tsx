"use client";

import * as React from "react";

import type {
  GridVisualState,
  HashTableVisualState,
  HeapVisualState,
  LinkedListVisualState,
  QueueVisualState,
  StackVisualState,
} from "@/contracts/events/visualization-state";
import type { AnimationIntent } from "@/contracts/visualization";

import { GridStructureView } from "./linear/grid-renderer";
import { HashTableStructureView } from "./linear/hash-table-renderer";
import { HeapStructureView } from "./linear/heap-renderer";
import { LinkedListStructureView } from "./linear/linked-list-renderer";
import { QueueStructureView, StackStructureView } from "./linear/stack-queue-renderer";

type LinearState =
  | StackVisualState
  | QueueVisualState
  | LinkedListVisualState
  | HashTableVisualState
  | HeapVisualState
  | GridVisualState;
type LinearKind = "stack" | "queue" | "linked-list" | "hash-table" | "heap" | "grid";

export function LinearRenderers({
  kind,
  state,
  animationIntent = null,
  reducedMotion = false,
}: {
  kind: LinearKind;
  state: LinearState;
  animationIntent?: AnimationIntent | null;
  reducedMotion?: boolean;
}): React.JSX.Element {
  void reducedMotion;
  if (kind === "stack")
    return (
      <StackStructureView state={state as StackVisualState} animationIntent={animationIntent} />
    );
  if (kind === "queue")
    return (
      <QueueStructureView state={state as QueueVisualState} animationIntent={animationIntent} />
    );
  if (kind === "linked-list")
    return (
      <LinkedListStructureView
        state={state as LinkedListVisualState}
        animationIntent={animationIntent}
      />
    );
  if (kind === "hash-table")
    return (
      <HashTableStructureView
        state={state as HashTableVisualState}
        animationIntent={animationIntent}
      />
    );
  if (kind === "heap")
    return <HeapStructureView state={state as HeapVisualState} animationIntent={animationIntent} />;
  return <GridStructureView state={state as GridVisualState} />;
}

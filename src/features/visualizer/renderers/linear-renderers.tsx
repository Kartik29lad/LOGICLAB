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
}: {
  kind: LinearKind;
  state: LinearState;
}): React.JSX.Element {
  if (kind === "stack") {
    const value = state as StackVisualState;
    return (
      <section className="viz-linear-lab" aria-label="Stack visualization">
        <div className="viz-structure-header">
          <strong>LIFO Stack</strong>
          <span>Top is the active end</span>
        </div>
        <div className="viz-stack">
          <span className="viz-end-label">TOP</span>
          {value.items.map((item, i) => (
            <div
              className="viz-structure-node"
              data-state={
                value.activeElements.includes(item as string | number) ? "current" : "default"
              }
              key={`${String(item)}-${i}`}
            >
              <span>{String(item)}</span>
              {i === value.items.length - 1 ? <small>top</small> : null}
            </div>
          ))}
        </div>
        <div className="viz-legend">
          <span>↑ push</span>
          <span>↓ pop</span>
        </div>
      </section>
    );
  }
  if (kind === "queue") {
    const value = state as QueueVisualState;
    return (
      <section className="viz-linear-lab" aria-label="Queue visualization">
        <div className="viz-structure-header">
          <strong>FIFO Queue</strong>
          <span>Items leave from the front</span>
        </div>
        <div className="viz-queue">
          <span className="viz-end-label">FRONT</span>
          {value.items.map((item, i) => (
            <div
              className="viz-structure-node"
              data-state={
                value.activeElements.includes(item as string | number) ? "current" : "default"
              }
              key={`${String(item)}-${i}`}
            >
              <span>{String(item)}</span>
              {i === value.items.length - 1 ? <small>rear</small> : null}
            </div>
          ))}
        </div>
        <div className="viz-legend">
          <span>enqueue →</span>
          <span>← dequeue</span>
        </div>
      </section>
    );
  }
  if (kind === "linked-list") {
    const value = state as LinkedListVisualState;
    return (
      <section className="viz-linear-lab" aria-label="Linked list visualization">
        <div className="viz-structure-header">
          <strong>Singly Linked List</strong>
          <span>Each node points to the next node</span>
        </div>
        <div className="viz-linked-list">
          <span className="viz-end-label">HEAD</span>
          {value.items.map((item, i) => (
            <React.Fragment key={item.id}>
              <div className="viz-structure-node" data-state={item.state}>
                <span>{String(item.value)}</span>
                <small>{item.id}</small>
              </div>
              {i < value.items.length - 1 ? (
                <span className="viz-link-arrow" aria-hidden="true">
                  →
                </span>
              ) : (
                <span className="viz-null">null</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>
    );
  }
  if (kind === "hash-table") {
    const value = state as HashTableVisualState;
    return (
      <section className="viz-linear-lab" aria-label="Hash table visualization">
        <div className="viz-structure-header">
          <strong>Hash Table</strong>
          <span>
            {value.activeBucket === undefined
              ? "Separate chaining"
              : `Bucket ${value.activeBucket} active`}
          </span>
        </div>
        <div className="viz-hash">
          {value.buckets.map((bucket) => (
            <div className="viz-hash-row" data-state={bucket.state} key={bucket.index}>
              <strong>{bucket.index}</strong>
              <span>
                {bucket.entries.map((entry) => (
                  <span
                    className="viz-hash-entry"
                    data-active={entry === value.activeKey}
                    key={String(entry)}
                  >
                    {String(entry)}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
        <div className="viz-legend">
          <span>hash → bucket</span>
          <span>collision → chain</span>
        </div>
      </section>
    );
  }
  if (kind === "heap") {
    const value = state as HeapVisualState;
    return (
      <section className="viz-linear-lab" aria-label="Heap visualization">
        <div className="viz-structure-header">
          <strong>{value.mode === "min" ? "Min Heap" : "Max Heap"}</strong>
          <span>Root = highest priority</span>
        </div>
        <div className="viz-heap-array">
          {value.items.map((item, index) => (
            <div
              className="viz-structure-node"
              data-state={
                value.swappingIndexes.includes(index)
                  ? "swapping"
                  : value.comparingIndexes.includes(index)
                    ? "comparing"
                    : index === value.activeIndex
                      ? "current"
                      : index >= value.heapBoundary
                        ? "disabled"
                        : "default"
              }
              key={`${index}-${item}`}
            >
              <span>{item}</span>
              <small>i={index}</small>
            </div>
          ))}
        </div>
        <div className="viz-legend">
          <span>parent(i)=⌊(i−1)/2⌋</span>
          <span>left=2i+1 · right=2i+2</span>
        </div>
      </section>
    );
  }
  const value = state as GridVisualState;
  return (
    <div className="viz-grid" role="img" aria-label="Grid visualization">
      {value.rows.flatMap((row, r) =>
        row.map((cell, c) => (
          <div className="viz-cell" key={`${r}-${c}`}>
            {String(cell)}
          </div>
        ))
      )}
    </div>
  );
}

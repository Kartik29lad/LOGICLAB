import { describe, expect, it } from "vitest";

import { Graph } from "@/core/graph/models/graph";
import { aStar } from "@/core/graph/pathfinding/a-star";

describe("A* trace state", () => {
  it("emits real g/h/f, open/closed and parent state", () => {
    const graph = new Graph(false);
    graph.addNode("A", "A", 0, 0);
    graph.addNode("B", "B", 1, 0);
    graph.addNode("C", "C", 2, 0);
    graph.addEdge("A", "B", 1);
    graph.addEdge("B", "C", 1);
    interface AStarTraceState {
      gScore?: Record<string, number>;
      hScore?: Record<string, number>;
      path: string[];
    }
    interface AStarPayload {
      newG?: number;
      f?: number;
    }
    const events: Array<{ type: string; state?: AStarTraceState; payload?: AStarPayload }> = [];
    aStar(graph, "A", "C", undefined, {
      emit: (type, payload, stateAfter) =>
        events.push({
          type,
          payload: payload as AStarPayload,
          state: stateAfter as AStarTraceState,
        }),
    });
    expect(
      events.some(
        (event) =>
          event.type === "VISIT" &&
          event.state?.gScore?.A === 0 &&
          (event.state?.hScore?.A ?? 0) > 0
      )
    ).toBe(true);
    expect(
      events.some(
        (event) =>
          event.type === "RELAX" && event.payload?.newG === 1 && event.payload?.f !== undefined
      )
    ).toBe(true);
    expect(
      events.some((event) => event.type === "FOUND" && event.state?.path.join("→") === "A→B→C")
    ).toBe(true);
  });
});

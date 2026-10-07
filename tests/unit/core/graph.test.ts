import { describe, expect, it } from "vitest";

import {
  aStar,
  breadthFirstSearch,
  depthFirstSearch,
  dijkstra,
  Graph,
} from "../../../src/core/graph";

describe("Phase 5: Graph Models & Algorithms", () => {
  it("builds directed and undirected graphs correctly", () => {
    const undirected = new Graph(false);
    undirected.addEdge("A", "B", 5);
    expect(undirected.getNeighbors("A")).toEqual([{ nodeId: "B", weight: 5 }]);
    expect(undirected.getNeighbors("B")).toEqual([{ nodeId: "A", weight: 5 }]);

    const directed = new Graph(true);
    directed.addEdge("A", "B", 5);
    expect(directed.getNeighbors("A")).toEqual([{ nodeId: "B", weight: 5 }]);
    expect(directed.getNeighbors("B")).toEqual([]);
  });

  it("performs Breadth-First Search (BFS) and measures hop distances", () => {
    const g = new Graph(false);
    g.addEdge("A", "B");
    g.addEdge("A", "C");
    g.addEdge("B", "D");
    g.addEdge("C", "E");

    const result = breadthFirstSearch(g, "A");
    expect(result.visitedOrder[0]).toBe("A");
    expect(result.distances["A"]).toBe(0);
    expect(result.distances["B"]).toBe(1);
    expect(result.distances["C"]).toBe(1);
    expect(result.distances["D"]).toBe(2);
    expect(result.distances["E"]).toBe(2);
  });

  it("performs Depth-First Search (DFS) traversal", () => {
    const g = new Graph(false);
    g.addEdge("A", "B");
    g.addEdge("B", "C");
    g.addEdge("A", "D");

    const result = depthFirstSearch(g, "A");
    expect(result.visitedOrder).toHaveLength(4);
    expect(result.visitedOrder[0]).toBe("A");
  });

  it("calculates shortest paths using Dijkstra's algorithm", () => {
    const g = new Graph(true);
    g.addEdge("A", "B", 4);
    g.addEdge("A", "C", 2);
    g.addEdge("C", "B", 1);
    g.addEdge("B", "D", 5);
    g.addEdge("C", "D", 8);

    const result = dijkstra(g, "A");
    // Direct A->B is 4, but A->C->B is 2+1=3
    expect(result.distances["B"]).toBe(3);
    // A->C->B->D is 2+1+5=8
    expect(result.distances["D"]).toBe(8);
    expect(result.getPathTo("D")).toEqual(["A", "C", "B", "D"]);
  });

  it("finds optimal path using A* search", () => {
    const g = new Graph(false);
    g.addNode("start", "Start", 0, 0);
    g.addNode("mid", "Mid", 1, 1);
    g.addNode("target", "Target", 2, 2);

    g.addEdge("start", "mid", 1.41);
    g.addEdge("mid", "target", 1.41);

    const result = aStar(g, "start", "target");
    expect(result.path).toEqual(["start", "mid", "target"]);
    expect(result.cost).toBeCloseTo(2.82, 1);
  });
});

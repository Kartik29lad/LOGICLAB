import type { GraphEdgeVisualState, GraphNodeVisualState } from "../contracts/visualization.types";

export class GraphVisualModel {
  public static deriveNodeState(
    nodeId: string,
    currentNodeId?: string,
    visitedNodes: Set<string> = new Set(),
    targetNodeId?: string
  ): GraphNodeVisualState {
    if (nodeId === currentNodeId) return "current";
    if (nodeId === targetNodeId) return "target";
    if (visitedNodes.has(nodeId)) return "visited";
    return "unvisited";
  }

  public static deriveEdgeState(
    source: string,
    target: string,
    activeEdges: Set<string> = new Set(),
    shortestPathEdges: Set<string> = new Set()
  ): GraphEdgeVisualState {
    const edgeKey = `${source}->${target}`;
    const reverseKey = `${target}->${source}`;

    if (shortestPathEdges.has(edgeKey) || shortestPathEdges.has(reverseKey)) {
      return "shortest-path";
    }
    if (activeEdges.has(edgeKey) || activeEdges.has(reverseKey)) {
      return "active";
    }
    return "default";
  }
}

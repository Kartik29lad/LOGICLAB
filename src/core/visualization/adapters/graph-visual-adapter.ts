import type {
  GraphEdgeVisual,
  GraphNodeVisual,
  GraphVisualState,
} from "../../../contracts/events/visualization-state";
import type { Graph } from "../../graph/models/graph";
import { GraphVisualModel } from "../models/graph-visual-model";

export interface GraphStepContext {
  currentNodeId?: string;
  visitedNodes?: string[];
  targetNodeId?: string;
  shortestPath?: string[];
  activeEdge?: { source: string; target: string };
}

export class GraphVisualAdapter {
  public static adaptGraph(graph: Graph, context: GraphStepContext = {}): GraphVisualState {
    const visitedSet = new Set(context.visitedNodes ?? []);
    const shortestPathEdges = new Set<string>();

    if (context.shortestPath && context.shortestPath.length > 1) {
      for (let i = 0; i < context.shortestPath.length - 1; i++) {
        shortestPathEdges.add(`${context.shortestPath[i]}->${context.shortestPath[i + 1]}`);
      }
    }

    const activeEdges = new Set<string>();
    if (context.activeEdge) {
      activeEdges.add(`${context.activeEdge.source}->${context.activeEdge.target}`);
    }

    const nodes: GraphNodeVisual[] = graph.getNodes().map((node) => ({
      id: node.id,
      label: node.label,
      x: node.x,
      y: node.y,
      state: GraphVisualModel.deriveNodeState(
        node.id,
        context.currentNodeId,
        visitedSet,
        context.targetNodeId
      ),
    }));

    const edges: GraphEdgeVisual[] = graph.getEdges().map((edge) => ({
      source: edge.source,
      target: edge.target,
      weight: edge.weight,
      state: GraphVisualModel.deriveEdgeState(
        edge.source,
        edge.target,
        activeEdges,
        shortestPathEdges
      ),
    }));

    return {
      type: "graph",
      nodes,
      edges,
      directed: graph.isDirected,
    };
  }
}

import type { CanonicalExecutionTrace } from "@/contracts/events/trace-events";

import {
  buildTrace,
  createObserver,
  GRAPH_EDGES,
  GRAPH_NODES,
  TraceEvent,
} from "./demo-traces-specialized";
import type { GraphExperiment } from "./graph-editor";

export async function createGraphTrace(
  slug: string,
  experiment?: GraphExperiment
): Promise<CanonicalExecutionTrace<unknown, unknown, unknown>> {
  const { Graph } = await import("@/core/graph/models/graph");
  const graph = new Graph(experiment?.directed ?? false);
  const nodes =
    experiment?.nodes ??
    GRAPH_NODES.map(([id, x, y]) => ({ id, label: id, x: x * 220 + 120, y: y * 180 + 90 }));
  const edges =
    experiment?.edges ?? GRAPH_EDGES.map(([source, target]) => ({ source, target, weight: 1 }));
  nodes.forEach((node) => graph.addNode(node.id, node.label, node.x, node.y));
  edges.forEach((edge) => graph.addEdge(edge.source, edge.target, edge.weight));
  const events: TraceEvent[] = [];
  const observer = createObserver(events);
  let output: unknown;
  if (slug === "bfs") {
    const { breadthFirstSearch } = await import("@/core/graph/traversal/bfs");
    output = breadthFirstSearch(
      graph,
      experiment?.start ?? graph.getNodes()[0]?.id ?? "A",
      observer
    );
  } else if (slug === "dfs") {
    const { depthFirstSearch } = await import("@/core/graph/traversal/dfs");
    output = depthFirstSearch(graph, experiment?.start ?? graph.getNodes()[0]?.id ?? "A", observer);
  } else if (slug === "dijkstra") {
    const { dijkstra } = await import("@/core/graph/pathfinding/dijkstra");
    output = dijkstra(graph, experiment?.start ?? graph.getNodes()[0]?.id ?? "A", observer);
  } else {
    const { aStar } = await import("@/core/graph/pathfinding/a-star");
    output = aStar(
      graph,
      experiment?.start ?? graph.getNodes()[0]?.id ?? "A",
      experiment?.target ?? graph.getNodes()[graph.getNodes().length - 1]?.id ?? "E",
      undefined,
      observer
    );
  }
  return buildTrace(
    slug,
    { nodes: graph.getNodes(), edges: graph.getEdges(), directed: graph.isDirected },
    output,
    events,
    {
      nodes: graph.getNodes().map((n) => n.id),
      edges: graph.getEdges().map((e) => [e.source, e.target]),
      directed: graph.isDirected,
      visited: [],
      current: undefined,
    }
  );
}

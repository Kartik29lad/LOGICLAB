import type { CodeReference } from "../../schema/content-types";

export const code: CodeReference[] = [
  {
    language: "typescript",
    entryPoint: "graph",
    source:
      "export interface GraphNode {\n  id: string;\n  label: string;\n  x?: number;\n  y?: number;\n}\n\nexport interface GraphEdge {\n  source: string;\n  target: string;\n  weight: number;\n}\n\nexport interface Neighbor {\n  nodeId: string;\n  weight: number;\n}\n\n/**\n * Deterministic Graph model supporting directed and undirected variants.\n */\nexport class Graph {\n  private nodes = new Map<string, GraphNode>();\n  private adjacencyList = new Map<string, Neighbor[]>();\n  private edges: GraphEdge[] = [];\n\n  constructor(public readonly isDirected = false) {}\n\n  public addNode(id: string, label = id, x?: number, y?: number): void {\n    if (!this.nodes.has(id)) {\n      this.nodes.set(id, { id, label, x, y });\n      this.adjacencyList.set(id, []);\n    }\n  }\n\n  public addEdge(source: string, target: string, weight = 1): void {\n    this.addNode(source);\n    this.addNode(target);\n\n    this.adjacencyList.get(source)!.push({ nodeId: target, weight });\n    this.edges.push({ source, target, weight });\n\n    if (!this.isDirected) {\n      this.adjacencyList.get(target)!.push({ nodeId: source, weight });\n    }\n  }\n\n  public getNeighbors(nodeId: string): Neighbor[] {\n    return this.adjacencyList.get(nodeId) ?? [];\n  }\n\n  public getNode(nodeId: string): GraphNode | undefined {\n    return this.nodes.get(nodeId);\n  }\n\n  public getNodes(): GraphNode[] {\n    return Array.from(this.nodes.values());\n  }\n\n  public getEdges(): GraphEdge[] {\n    return [...this.edges];\n  }\n\n  public hasNode(nodeId: string): boolean {\n    return this.nodes.has(nodeId);\n  }\n\n  public nodeCount(): number {\n    return this.nodes.size;\n  }\n}\n",
    stepMappings: [{ action: "MAIN", startLine: 1, endLine: 72 }],
  },
];

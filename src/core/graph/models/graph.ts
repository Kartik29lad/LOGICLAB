export interface GraphNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

export interface Neighbor {
  nodeId: string;
  weight: number;
}

/**
 * Deterministic Graph model supporting directed and undirected variants.
 */
export class Graph {
  private nodes = new Map<string, GraphNode>();
  private adjacencyList = new Map<string, Neighbor[]>();
  private edges: GraphEdge[] = [];

  constructor(public readonly isDirected = false) {}

  public addNode(id: string, label = id, x?: number, y?: number): void {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, { id, label, x, y });
      this.adjacencyList.set(id, []);
    }
  }

  public addEdge(source: string, target: string, weight = 1): void {
    this.addNode(source);
    this.addNode(target);

    this.adjacencyList.get(source)!.push({ nodeId: target, weight });
    this.edges.push({ source, target, weight });

    if (!this.isDirected) {
      this.adjacencyList.get(target)!.push({ nodeId: source, weight });
    }
  }

  public getNeighbors(nodeId: string): Neighbor[] {
    return this.adjacencyList.get(nodeId) ?? [];
  }

  public getNode(nodeId: string): GraphNode | undefined {
    return this.nodes.get(nodeId);
  }

  public getNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  public getEdges(): GraphEdge[] {
    return [...this.edges];
  }

  public hasNode(nodeId: string): boolean {
    return this.nodes.has(nodeId);
  }

  public nodeCount(): number {
    return this.nodes.size;
  }
}

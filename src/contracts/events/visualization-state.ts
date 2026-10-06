/**
 * Visualization State Contracts
 * Defines visual model contracts consumed by SVG/DOM visualizers.
 */

export interface ArrayElementVisual {
  id: string;
  value: number;
  originalIndex: number;
  currentIndex: number;
  state: "default" | "comparing" | "swapping" | "sorted" | "selected" | "pivot";
}

export interface ArrayVisualState {
  type: "array";
  elements: ArrayElementVisual[];
  pointers: Record<string, number>;
}

export interface GraphNodeVisual {
  id: string;
  label: string;
  x?: number;
  y?: number;
  state: "unvisited" | "visiting" | "visited" | "current" | "target";
  distance?: number;
}

export interface GraphEdgeVisual {
  source: string;
  target: string;
  weight?: number;
  state: "default" | "active" | "traversed" | "shortest-path";
}

export interface GraphVisualState {
  type: "graph";
  nodes: GraphNodeVisual[];
  edges: GraphEdgeVisual[];
  directed: boolean;
}

export interface TreeNodeVisual {
  id: string;
  value: number | string;
  leftId?: string;
  rightId?: string;
  state: "default" | "active" | "visited" | "inserting" | "balancing";
}

export interface TreeVisualState {
  type: "tree";
  rootId?: string;
  nodes: Record<string, TreeNodeVisual>;
}

export type VisualStateSnapshot = ArrayVisualState | GraphVisualState | TreeVisualState;

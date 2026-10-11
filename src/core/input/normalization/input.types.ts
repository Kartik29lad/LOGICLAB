import type { GraphEdge, GraphNode } from "../../graph/models/graph";

export type ExecutionInputKind = "array" | "string" | "graph" | "tree" | "operations";

export interface NormalizedArrayInput {
  kind: "array";
  values: number[];
}

export interface NormalizedStringInput {
  kind: "string";
  value: string;
}

export interface NormalizedGraphInput {
  kind: "graph";
  directed: boolean;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface NormalizedTreeInput {
  kind: "tree";
  values: number[];
}

export interface NormalizedOperation {
  type: string;
  value?: unknown;
}

export interface NormalizedOperationSequence {
  kind: "operations";
  operations: NormalizedOperation[];
}

export type NormalizedExecutionInput =
  | NormalizedArrayInput
  | NormalizedStringInput
  | NormalizedGraphInput
  | NormalizedTreeInput
  | NormalizedOperationSequence;

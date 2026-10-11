export interface DataStructureOperationComplexity {
  operation: string;
  average: string;
  worst: string;
}

export interface DataStructureMetadata {
  id: string;
  name: string;
  category: "linear" | "tree" | "hash" | "heap" | "string" | "graph";
  description: string;
  operations: DataStructureOperationComplexity[];
  space: string;
  notes?: string[];
}

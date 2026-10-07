import type { AlgorithmComplexity } from "./complexity.types";

export type AlgorithmCategory = "sorting" | "searching" | "graph" | "tree";

export interface AlgorithmMetadata {
  id: string;
  slug: string;
  name: string;
  category: AlgorithmCategory;
  description: string;
  complexity: AlgorithmComplexity;
}

export interface SortMetrics {
  comparisons: number;
  swaps: number;
}

export interface SortResult<T> {
  sorted: T[];
  metrics: SortMetrics;
}

export interface SearchMetrics {
  comparisons: number;
  steps: number;
}

export interface SearchResult {
  foundIndex: number;
  metrics: SearchMetrics;
}

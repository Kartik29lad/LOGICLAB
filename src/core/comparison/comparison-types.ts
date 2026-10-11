export interface ComparisonMetrics {
  comparisons?: number;
  swaps?: number;
  writes?: number;
  visitedNodes?: number;
  pathCost?: number;
  steps: number;
  durationMs: number;
}

export interface ComparisonAlgorithmResult {
  slug: string;
  name: string;
  result: unknown;
  metrics: ComparisonMetrics;
  complexity: { best: string; average: string; worst: string; space: string };
}

export interface ComparisonInput {
  algorithmSlugs: string[];
  input: unknown;
  options?: Record<string, unknown>;
  seed?: number;
}

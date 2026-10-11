import type { ComparisonAlgorithmResult } from "../comparison/comparison-types";

export interface ExperimentDefinition {
  title: string;
  description?: string;
  algorithmSlugs: string[];
  input: unknown;
  configuration?: Record<string, unknown>;
  seed?: number;
}

export interface ExperimentResult {
  algorithmResults: ComparisonAlgorithmResult[];
  reproducible: boolean;
}

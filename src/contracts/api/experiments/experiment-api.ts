import type { ComparisonAlgorithmResult } from "@/core/comparison";

export interface ExperimentRunRequest {
  title: string;
  description?: string;
  algorithmSlugs: string[];
  input: unknown;
  configuration?: Record<string, unknown>;
  seed?: number;
}

export interface ExperimentRunResponse {
  experimentId: string;
  results: ComparisonAlgorithmResult[];
  reproducible: boolean;
}

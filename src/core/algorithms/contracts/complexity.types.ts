/**
 * Theoretical time and space complexity annotations for algorithms.
 */

export interface TimeComplexityModel {
  best: string;
  average: string;
  worst: string;
}

export interface AlgorithmComplexity {
  time: TimeComplexityModel;
  space: string;
  isStable?: boolean;
  isInPlace?: boolean;
}

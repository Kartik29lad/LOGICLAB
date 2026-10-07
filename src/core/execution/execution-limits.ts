import { APPLICATION_CONFIG } from "../../config/application";

export interface ExecutionLimits {
  maxSteps: number;
  maxRuntimeMs: number;
  maxInputSize: number;
  maxGraphNodes: number;
  maxGraphEdges: number;
}

export const DEFAULT_EXECUTION_LIMITS: ExecutionLimits = {
  maxSteps: APPLICATION_CONFIG.limits.maxExecutionSteps,
  maxRuntimeMs: APPLICATION_CONFIG.limits.maxExecutionTimeMs,
  maxInputSize: APPLICATION_CONFIG.limits.maxArraySize,
  maxGraphNodes: APPLICATION_CONFIG.limits.maxGraphNodes,
  maxGraphEdges: APPLICATION_CONFIG.limits.maxGraphEdges,
};

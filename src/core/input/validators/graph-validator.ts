import { APPLICATION_CONFIG } from "../../../config/application";
import type { Graph } from "../../graph/models/graph";
import type { ValidationResult } from "./array-validator";

export interface GraphValidationOptions {
  minNodes?: number;
  maxNodes?: number;
  maxEdges?: number;
}

export class GraphValidator {
  public static validate(graph: Graph, options: GraphValidationOptions = {}): ValidationResult {
    const minNodes = options.minNodes ?? APPLICATION_CONFIG.limits.minGraphNodes;
    const maxNodes = options.maxNodes ?? APPLICATION_CONFIG.limits.maxGraphNodes;
    const maxEdges = options.maxEdges ?? APPLICATION_CONFIG.limits.maxGraphEdges;

    const nodeCount = graph.nodeCount();
    const edgeCount = graph.getEdges().length;

    if (nodeCount < minNodes) {
      return {
        isValid: false,
        error: `Graph node count (${nodeCount}) is below minimum limit of ${minNodes}.`,
      };
    }

    if (nodeCount > maxNodes) {
      return {
        isValid: false,
        error: `Graph node count (${nodeCount}) exceeds maximum limit of ${maxNodes}.`,
      };
    }

    if (edgeCount > maxEdges) {
      return {
        isValid: false,
        error: `Graph edge count (${edgeCount}) exceeds maximum limit of ${maxEdges}.`,
      };
    }

    return { isValid: true };
  }
}

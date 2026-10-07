import { Graph } from "../../graph/models/graph";

export interface GraphParseResult {
  success: boolean;
  graph?: Graph;
  error?: string;
}

export class GraphParser {
  /**
   * Parses edge descriptions (e.g. "A-B:4, A-C:2" or directed "A->B:5, B->C:3")
   */
  public static parse(input: string, isDirected = false): GraphParseResult {
    const trimmed = input.trim();
    if (trimmed.length === 0) {
      return { success: false, error: "Graph input string cannot be empty." };
    }

    const graph = new Graph(isDirected);

    // Delimited edge pairs separated by commas or semicolons
    const edgeTokens = trimmed
      .split(/[,;\n]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    for (const token of edgeTokens) {
      // Formats: "A->B:4", "A-B:4", "A->B", "A-B"
      const match = token.match(/^([A-Za-z0-9_-]+)(?:->|-)([A-Za-z0-9_-]+)(?::([0-9.]+))?$/);
      if (!match) {
        return {
          success: false,
          error: `Malformed edge token: "${token}". Expected format: "A-B:weight" or "A->B:weight"`,
        };
      }

      const source = match[1]!;
      const target = match[2]!;
      const weight = match[3] !== undefined ? parseFloat(match[3]) : 1;

      if (isNaN(weight) || weight < 0) {
        return {
          success: false,
          error: `Invalid weight in edge "${token}". Edge weights must be non-negative.`,
        };
      }

      graph.addEdge(source, target, weight);
    }

    return {
      success: true,
      graph,
    };
  }
}

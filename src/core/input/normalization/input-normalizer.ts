import type { GraphEdge, GraphNode } from "../../graph/models/graph";
import { InputNormalizationError } from "./input-errors";
import type {
  ExecutionInputKind,
  NormalizedExecutionInput,
  NormalizedOperation,
} from "./input.types";

export interface InputNormalizationLimits {
  maxInputSize: number;
  maxStringLength: number;
  maxGraphNodes: number;
  maxGraphEdges: number;
  maxOperations: number;
}

const DEFAULT_LIMITS: InputNormalizationLimits = {
  maxInputSize: 10_000,
  maxStringLength: 10_000,
  maxGraphNodes: 1_000,
  maxGraphEdges: 5_000,
  maxOperations: 5_000,
};

export class InputNormalizer {
  public constructor(private readonly limits: InputNormalizationLimits = DEFAULT_LIMITS) {}

  public normalize(kind: ExecutionInputKind, raw: unknown): NormalizedExecutionInput {
    switch (kind) {
      case "array":
        return this.normalizeArray(raw);
      case "string":
        return this.normalizeString(raw);
      case "graph":
        return this.normalizeGraph(raw);
      case "tree":
        return this.normalizeTree(raw);
      case "operations":
        return this.normalizeOperations(raw);
      default:
        return this.assertNever(kind);
    }
  }

  private normalizeArray(raw: unknown): NormalizedExecutionInput {
    if (
      !Array.isArray(raw) ||
      raw.some((value) => typeof value !== "number" || !Number.isFinite(value))
    ) {
      throw new InputNormalizationError("Array input must contain only finite numbers.");
    }
    this.assertSize(raw.length, this.limits.maxInputSize, "Array");
    return { kind: "array", values: [...raw] };
  }

  private normalizeString(raw: unknown): NormalizedExecutionInput {
    if (typeof raw !== "string") {
      throw new InputNormalizationError("String input must be a string.");
    }
    this.assertSize(raw.length, this.limits.maxStringLength, "String");
    return { kind: "string", value: raw };
  }

  private normalizeGraph(raw: unknown): NormalizedExecutionInput {
    if (!this.isRecord(raw)) {
      throw new InputNormalizationError("Graph input must be an object.");
    }
    const directed = raw.directed === true;
    const nodes = this.normalizeNodes(raw.nodes);
    const edges = this.normalizeEdges(raw.edges);
    this.assertSize(nodes.length, this.limits.maxGraphNodes, "Graph node");
    this.assertSize(edges.length, this.limits.maxGraphEdges, "Graph edge");

    const nodeIds = new Set(nodes.map((node) => node.id));
    for (const edge of edges) {
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
        throw new InputNormalizationError("Graph edges must reference existing nodes.");
      }
    }

    return { kind: "graph", directed, nodes, edges };
  }

  private normalizeTree(raw: unknown): NormalizedExecutionInput {
    if (
      !Array.isArray(raw) ||
      raw.some((value) => typeof value !== "number" || !Number.isFinite(value))
    ) {
      throw new InputNormalizationError("Tree input must be an array of finite numbers.");
    }
    this.assertSize(raw.length, this.limits.maxInputSize, "Tree");
    return { kind: "tree", values: [...raw] };
  }

  private normalizeOperations(raw: unknown): NormalizedExecutionInput {
    if (!Array.isArray(raw)) {
      throw new InputNormalizationError("Operation input must be an array.");
    }
    this.assertSize(raw.length, this.limits.maxOperations, "Operation");
    const operations: NormalizedOperation[] = raw.map((operation, index) => {
      if (
        !this.isRecord(operation) ||
        typeof operation.type !== "string" ||
        operation.type.trim() === ""
      ) {
        throw new InputNormalizationError(
          `Operation at index ${index} must contain a non-empty type.`
        );
      }
      return { type: operation.type.trim(), value: operation.value };
    });
    return { kind: "operations", operations };
  }

  private normalizeNodes(raw: unknown): GraphNode[] {
    if (!Array.isArray(raw)) throw new InputNormalizationError("Graph nodes must be an array.");
    return raw.map((node, index) => {
      if (!this.isRecord(node) || typeof node.id !== "string" || node.id.trim() === "") {
        throw new InputNormalizationError(`Graph node at index ${index} has an invalid id.`);
      }
      if (node.label !== undefined && typeof node.label !== "string") {
        throw new InputNormalizationError(`Graph node ${node.id} has an invalid label.`);
      }
      return {
        id: node.id.trim(),
        label: typeof node.label === "string" ? node.label : node.id.trim(),
        x: this.optionalFiniteNumber(node.x),
        y: this.optionalFiniteNumber(node.y),
      };
    });
  }

  private normalizeEdges(raw: unknown): GraphEdge[] {
    if (!Array.isArray(raw)) throw new InputNormalizationError("Graph edges must be an array.");
    return raw.map((edge, index) => {
      if (
        !this.isRecord(edge) ||
        typeof edge.source !== "string" ||
        typeof edge.target !== "string"
      ) {
        throw new InputNormalizationError(`Graph edge at index ${index} has invalid endpoints.`);
      }
      const weight = edge.weight === undefined ? 1 : edge.weight;
      if (typeof weight !== "number" || !Number.isFinite(weight) || weight < 0) {
        throw new InputNormalizationError(`Graph edge at index ${index} has an invalid weight.`);
      }
      return { source: edge.source.trim(), target: edge.target.trim(), weight };
    });
  }

  private optionalFiniteNumber(value: unknown): number | undefined {
    if (value === undefined) return undefined;
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new InputNormalizationError("Graph coordinates must be finite numbers.");
    }
    return value;
  }

  private assertSize(size: number, maximum: number, label: string): void {
    if (size > maximum)
      throw new InputNormalizationError(
        `${label} input exceeds the configured limit of ${maximum}.`
      );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private assertNever(value: never): never {
    throw new InputNormalizationError(`Unsupported input kind: ${String(value)}`);
  }
}

import type { ExecutionTraceStep } from "@/contracts/events/trace-events";

export interface BfsStepView {
  queue: string[];
  discovered: string[];
  visited: string[];
  distances: Record<string, number>;
  parents: Record<string, string | undefined>;
  traversalOrder: string[];
  current?: string;
  currentEdge?: { source: string; target: string };
  phase: "discover" | "dequeue" | "visit" | "complete";
}

export function deriveBfsStepView(step: ExecutionTraceStep): BfsStepView {
  const state = (step.stateAfter ?? {}) as Record<string, unknown>;
  const payload = (step.event.payload ?? {}) as Record<string, unknown>;
  const queue = stringArray(payload.queue ?? state.queue);
  const visited = stringArray(payload.visited ?? state.visited);
  const distances = numberRecord(payload.distances ?? state.distances);
  const parents = parentRecord(payload.parents ?? state.predecessors);
  const discovered = Object.keys(distances);
  const current =
    stringValue(payload.current) ?? stringValue(state.current) ?? stringValue(payload.node);
  const node = stringValue(payload.node);
  const parent = node ? parents[node] : undefined;
  const currentEdge =
    parent && node && parent !== node ? { source: parent, target: node } : undefined;

  return {
    queue,
    discovered,
    visited,
    distances,
    parents,
    traversalOrder: visited,
    current,
    currentEdge,
    phase: phaseFor(step.event.type),
  };
}

function phaseFor(type: string): BfsStepView["phase"] {
  if (type === "ENQUEUE") return "discover";
  if (type === "DEQUEUE") return "dequeue";
  if (type === "VISIT") return "visit";
  return "complete";
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function numberRecord(value: unknown): Record<string, number> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (Object.fromEntries(
        Object.entries(value).filter(([, item]) => typeof item === "number")
      ) as Record<string, number>)
    : {};
}

function parentRecord(value: unknown): Record<string, string | undefined> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (Object.fromEntries(
        Object.entries(value)
          .filter(([, item]) => typeof item === "string" || item === null)
          .map(([key, item]) => [key, item === null ? undefined : item])
      ) as Record<string, string | undefined>)
    : {};
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

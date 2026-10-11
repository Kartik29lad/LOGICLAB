import type { ExecutionTraceStep } from "@/contracts/events/trace-events";

export interface DfsStepView {
  stack: string[];
  visited: string[];
  traversalOrder: string[];
  currentPath: string[];
  current?: string;
  currentEdge?: { source: string; target: string };
  backtrackedFrom?: string;
  returnTo?: string;
  phase: "push" | "visit" | "backtrack" | "complete";
}

export function deriveDfsStepView(step: ExecutionTraceStep): DfsStepView {
  const state = asRecord(step.stateAfter);
  const payload = asRecord(step.event.payload);
  const stack = stringArray(payload.stack ?? state.stack);
  const visited = stringArray(payload.visited ?? state.visited);
  const traversalOrder = stringArray(payload.traversalOrder ?? state.traversalOrder ?? visited);
  const currentPath = stringArray(payload.currentPath ?? state.currentPath ?? stack);
  const current = stringValue(payload.current) ?? stringValue(state.current) ?? stack.at(-1);
  const currentEdge = edgeValue(payload.currentEdge ?? state.currentEdge);
  const node = stringValue(payload.node);
  const returnTo = stringValue(payload.returnTo);
  return {
    stack,
    visited,
    traversalOrder,
    currentPath,
    current,
    currentEdge,
    backtrackedFrom: step.event.type === "BACKTRACK" ? node : undefined,
    returnTo,
    phase: phaseFor(step.event.type),
  };
}

function phaseFor(type: string): DfsStepView["phase"] {
  if (type === "PUSH") return "push";
  if (type === "VISIT") return "visit";
  if (type === "BACKTRACK") return "backtrack";
  return "complete";
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function edgeValue(value: unknown): { source: string; target: string } | undefined {
  const record = asRecord(value);
  return typeof record.source === "string" && typeof record.target === "string"
    ? { source: record.source, target: record.target }
    : undefined;
}

import type { ExecutionTraceStep } from "@/contracts/events/trace-events";
import type { SemanticVisualState, TreeVisualState } from "@/contracts/events/visualization-state";
import type { ExecutionMetrics } from "@/contracts/execution";

type RawTreeNode = {
  id: string;
  value: number;
  left: RawTreeNode | null;
  right: RawTreeNode | null;
  state?: string;
};
type RawTreeState = { root: RawTreeNode | null; current?: number; status?: string };

export function treeStepToVisualization(
  step: ExecutionTraceStep,
  metrics: ExecutionMetrics,
  status: TreeVisualState["status"]
): TreeVisualState {
  const state = step.stateAfter as RawTreeState;
  const nodes: Record<string, TreeVisualState["nodes"][string]> = {};
  const walk = (node: RawTreeNode | null): string | undefined => {
    if (!node) return undefined;
    const leftId = walk(node.left);
    const rightId = walk(node.right);
    const visualState: SemanticVisualState =
      node.state === "success"
        ? "success"
        : node.state === "current"
          ? "current"
          : step.event.type === "FOUND" && node.value === state.current
            ? "success"
            : "default";
    nodes[node.id] = { id: node.id, value: node.value, leftId, rightId, state: visualState };
    return node.id;
  };
  const rootId = walk(state.root);
  const current = state.current === undefined ? undefined : String(state.current);
  return {
    type: "tree",
    rootId,
    nodes,
    stepIndex: step.stepIndex,
    activeElements: current ? [current] : [],
    highlightedElements: [],
    visitedNodes: [],
    currentNode: current,
    queueState: [],
    stackState: [],
    metrics,
    status,
  };
}

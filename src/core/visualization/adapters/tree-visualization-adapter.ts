import type {
  SemanticVisualState,
  TreeVisualState,
} from "../../../contracts/events/visualization-state";
import type { ExecutionMetrics } from "../../../contracts/execution";
import type { BSTNode } from "../../data-structures/tree/binary-search-tree";
import { createVisualizationCommon } from "./visualization-common";

export function toTreeVisualizationState(
  root: BSTNode | null,
  stepIndex: number,
  metrics: ExecutionMetrics,
  status: TreeVisualState["status"],
  activeValues: readonly number[] = [],
  visitedValues: readonly number[] = []
): TreeVisualState {
  const nodes: Record<string, TreeVisualState["nodes"][string]> = {};
  const active = new Set(activeValues);
  const visited = new Set(visitedValues);
  let counter = 0;
  const walk = (node: BSTNode | null): string | undefined => {
    if (!node) return undefined;
    const id = `tree-${counter++}`;
    const leftId = walk(node.left);
    const rightId = walk(node.right);
    nodes[id] = {
      id,
      value: node.value,
      leftId,
      rightId,
      state: stateFor(node.value, active, visited),
    };
    return id;
  };
  const rootId = walk(root);
  return {
    type: "tree",
    rootId,
    nodes,
    ...createVisualizationCommon(
      stepIndex,
      metrics,
      status,
      [...active],
      [],
      [...visited].map(String)
    ),
  };
}

function stateFor(value: number, active: Set<number>, visited: Set<number>): SemanticVisualState {
  if (active.has(value)) return "current";
  if (visited.has(value)) return "visited";
  return "default";
}

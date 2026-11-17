import type {
  AlgorithmStepObserver,
  CanonicalExecutionTrace,
  ExecutionTraceStep,
  TraceMetricSnapshot,
} from "@/contracts/events/trace-events";

export type TreeOperation = "insert" | "search" | "delete";
export interface TreeExperiment {
  values: number[];
  operation: TreeOperation;
  target: number;
}
export const DEFAULT_TREE_EXPERIMENT: TreeExperiment = {
  values: [50, 30, 70, 20, 40, 60, 80],
  operation: "search",
  target: 60,
};
export const TREE_LIMIT = 30;

interface TreeNodeShape {
  value: number;
  left: TreeNodeShape | null;
  right: TreeNodeShape | null;
}

interface TreeInstance {
  root: TreeNodeShape | null;
  insert(value: number): void;
  inOrder(): number[];
}

export function cloneTreeExperiment(input: TreeExperiment): TreeExperiment {
  return { values: [...input.values], operation: input.operation, target: input.target };
}

export async function createTreeTrace(
  experiment: TreeExperiment = DEFAULT_TREE_EXPERIMENT
): Promise<CanonicalExecutionTrace<unknown, unknown, unknown>> {
  const { BinarySearchTree } = await import("@/core/data-structures/tree/binary-search-tree");
  const tree = new BinarySearchTree();
  const events: Array<{
    type: Parameters<AlgorithmStepObserver["emit"]>[0];
    payload?: Record<string, unknown>;
    stateAfter?: unknown;
  }> = [];
  const observer: AlgorithmStepObserver = {
    emit: (type, payload, stateAfter) => events.push({ type, payload, stateAfter }),
  };
  for (const value of experiment.values.slice(0, TREE_LIMIT)) tree.insert(value);
  const initial = snapshotTree(tree.root);
  const tracedTree = new BinarySearchTree();
  for (const value of experiment.values.slice(0, TREE_LIMIT)) tracedTree.insert(value);
  if (experiment.operation === "insert") insertWithTrace(tracedTree, experiment.target, observer);
  else if (experiment.operation === "search")
    searchWithTrace(tracedTree.root, experiment.target, observer);
  else deleteWithTrace(tracedTree, experiment.target, () => new BinarySearchTree(), observer);
  const steps: ExecutionTraceStep<unknown>[] = [];
  let state: unknown = initial;
  const metrics = emptyMetrics();
  for (const [index, event] of events.entries()) {
    applyMetric(metrics, event.type);
    const stateBefore = structuredClone(state);
    const stateAfter =
      event.stateAfter === undefined ? stateBefore : structuredClone(event.stateAfter);
    const snapshot = { ...metrics };
    const canonical = {
      stepIndex: index,
      type: event.type,
      payload: event.payload,
      stateBefore,
      stateAfter,
      metrics: snapshot,
    };
    steps.push({ stepIndex: index, event: canonical, stateBefore, stateAfter, metrics: snapshot });
    state = stateAfter;
  }
  return {
    executionId: `visualizer-tree-${experiment.operation}`,
    algorithmSlug: "binary-search-tree",
    input: experiment,
    output: { operation: experiment.operation, target: experiment.target },
    initialState: initial,
    steps,
    finalState: state,
    metrics,
    status: "completed",
  };
}

function insertWithTrace(tree: TreeInstance, value: number, observer: AlgorithmStepObserver): void {
  if (!tree.root) {
    tree.insert(value);
    observer.emit("INSERT", { value, relation: "root" }, snapshotTree(tree.root));
    return;
  }
  let current: TreeNodeShape | null = tree.root;
  while (current) {
    observer.emit("COMPARE", { current: current.value, target: value }, snapshotTree(tree.root));
    if (value === current.value) return;
    if (value < current.value) {
      if (!current.left) {
        tree.insert(value);
        observer.emit(
          "INSERT",
          { value, parent: current.value, side: "left" },
          snapshotTree(tree.root)
        );
        return;
      }
      current = current.left;
    } else {
      if (!current.right) {
        tree.insert(value);
        observer.emit(
          "INSERT",
          { value, parent: current.value, side: "right" },
          snapshotTree(tree.root)
        );
        return;
      }
      current = current.right;
    }
  }
}

function searchWithTrace(
  root: TreeNodeShape | null,
  target: number,
  observer: AlgorithmStepObserver
): void {
  let current = root;
  while (current) {
    observer.emit("COMPARE", { current: current.value, target }, snapshotTree(root, current.value));
    if (current.value === target) {
      observer.emit(
        "FOUND",
        { target, node: current.value },
        snapshotTree(root, current.value, "success")
      );
      return;
    }
    current = target < current.value ? current.left : current.right;
  }
  observer.emit("NOT_FOUND", { target }, snapshotTree(root));
}

function deleteWithTrace(
  tree: TreeInstance,
  target: number,
  createTree: () => TreeInstance,
  observer: AlgorithmStepObserver
): void {
  const values = tree.inOrder();
  let current = tree.root;
  while (current) {
    observer.emit(
      "COMPARE",
      { current: current.value, target },
      snapshotTree(tree.root, current.value)
    );
    if (current.value === target) break;
    current = target < current.value ? current.left : current.right;
  }
  if (!current) {
    observer.emit("NOT_FOUND", { target }, snapshotTree(tree.root));
    return;
  }
  const replacementValues = values.filter((value) => value !== target);
  const rebuilt = createTree();
  replacementValues.forEach((value) => rebuilt.insert(value));
  tree.root = rebuilt.root;
  observer.emit("REMOVE", { target, value: target }, snapshotTree(tree.root));
}

function snapshotTree(root: TreeNodeShape | null, current?: number, status?: string): unknown {
  const walk = (node: TreeNodeShape | null): unknown => {
    if (!node) return null;
    return {
      id: `tree-node-${node.value}`,
      value: node.value,
      left: walk(node.left),
      right: walk(node.right),
      state: node.value === current ? (status === "success" ? "success" : "current") : "default",
    };
  };
  return { root: walk(root), current, status };
}

function emptyMetrics(): TraceMetricSnapshot {
  return { comparisons: 0, swaps: 0, reads: 0, writes: 0, visits: 0, iterations: 0, elapsedMs: 0 };
}

function applyMetric(metrics: TraceMetricSnapshot, type: string): void {
  if (type === "COMPARE") metrics.comparisons += 1;
  if (type === "VISIT") metrics.visits += 1;
  if (type === "WRITE" || type === "INSERT" || type === "REMOVE") metrics.writes += 1;
  metrics.iterations += 1;
}

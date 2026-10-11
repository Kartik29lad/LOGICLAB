import type { ExecutionEventType } from "@/contracts/events/trace-events";

export interface AlgorithmVisualRule {
  algorithm: string;
  event: ExecutionEventType;
  visualAction: string;
  emphasis: string;
}

const common = (
  algorithm: string,
  event: ExecutionEventType,
  visualAction: string,
  emphasis: string
): AlgorithmVisualRule => ({ algorithm, event, visualAction, emphasis });

export const ALGORITHM_VISUAL_RULES: AlgorithmVisualRule[] = [
  common("sorting", "COMPARE", "Highlight both candidates.", "comparing"),
  common("sorting", "SWAP", "Animate both values to their new positions.", "swapping"),
  common("sorting", "WRITE", "Emphasize the written value and destination.", "writing"),
  common("sorting", "PIVOT", "Emphasize the pivot and active partition.", "pivot"),
  common("sorting", "MARK_SORTED", "De-emphasize the completed region.", "sorted"),
  common("bfs", "ENQUEUE", "Highlight discovery and the queue insertion.", "discovered"),
  common("bfs", "DEQUEUE", "Emphasize the node leaving the FIFO queue.", "current"),
  common("bfs", "VISIT", "Emphasize the current node and traversal order.", "visited"),
  common("dfs", "PUSH", "Emphasize the recursion/frontier stack.", "current"),
  common("dfs", "BACKTRACK", "Show the return along the active path.", "path"),
  common("dijkstra", "RELAX", "Emphasize the weighted edge and distance update.", "active"),
  common("a-star", "RELAX", "Emphasize candidate scores and frontier movement.", "active"),
  common("search", "FOUND", "Emphasize the matching target.", "success"),
  common("search", "NOT_FOUND", "Emphasize the exhausted search state.", "error"),
];

export function getAlgorithmVisualRule(
  algorithm: string,
  event: ExecutionEventType
): AlgorithmVisualRule | undefined {
  const family = algorithm.includes("sort")
    ? "sorting"
    : ["bfs", "dfs", "dijkstra", "a-star"].includes(algorithm)
      ? algorithm
      : "search";
  return ALGORITHM_VISUAL_RULES.find((rule) => rule.algorithm === family && rule.event === event);
}

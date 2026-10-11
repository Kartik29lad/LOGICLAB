import type { SemanticVisualState } from "@/contracts/events/visualization-state";

export { getAlgorithmVisualRule } from "./algorithm-visual-rules";

export interface VisualSemanticRule {
  state: SemanticVisualState;
  label: string;
  description: string;
  priority: number;
}

export const VISUAL_LANGUAGE: Record<SemanticVisualState, VisualSemanticRule> = {
  default: {
    state: "default",
    label: "Default",
    description: "Not currently involved in the operation.",
    priority: 0,
  },
  current: {
    state: "current",
    label: "Current",
    description: "The element currently being processed.",
    priority: 90,
  },
  selected: {
    state: "selected",
    label: "Selected",
    description: "The selected element or target.",
    priority: 80,
  },
  comparing: {
    state: "comparing",
    label: "Comparing",
    description: "Elements currently being compared.",
    priority: 80,
  },
  swapping: {
    state: "swapping",
    label: "Swapping",
    description: "Elements currently exchanging positions.",
    priority: 85,
  },
  active: {
    state: "active",
    label: "Active",
    description: "The element or connection driving the current operation.",
    priority: 70,
  },
  visited: {
    state: "visited",
    label: "Visited",
    description: "Already processed by the traversal.",
    priority: 40,
  },
  discovered: {
    state: "discovered",
    label: "Discovered",
    description: "Known to the algorithm but not fully processed.",
    priority: 50,
  },
  sorted: {
    state: "sorted",
    label: "Sorted",
    description: "Confirmed to be in its final sorted position.",
    priority: 35,
  },
  target: {
    state: "target",
    label: "Target",
    description: "The requested search destination.",
    priority: 75,
  },
  path: {
    state: "path",
    label: "Final path",
    description: "Part of the resulting path.",
    priority: 95,
  },
  pivot: {
    state: "pivot",
    label: "Pivot",
    description: "The pivot currently defining a partition.",
    priority: 88,
  },
  writing: {
    state: "writing",
    label: "Writing",
    description: "The value is being written or updated.",
    priority: 86,
  },
  boundary: {
    state: "boundary",
    label: "Boundary",
    description: "Marks an active algorithmic boundary.",
    priority: 45,
  },
  disabled: {
    state: "disabled",
    label: "Disabled",
    description: "Not available for the current operation.",
    priority: 5,
  },
  error: {
    state: "error",
    label: "Error",
    description: "The state contains an error condition.",
    priority: 100,
  },
  success: {
    state: "success",
    label: "Success",
    description: "The operation completed successfully.",
    priority: 100,
  },
};

export const VISUAL_LANGUAGE_CSS_CLASS = "logiclab-visual-language";

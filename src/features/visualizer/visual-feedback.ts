import type { ExecutionEventType } from "@/contracts/events/trace-events";

export type FeedbackTone = "neutral" | "info" | "success" | "warning";
export interface VisualFeedback {
  label: string;
  message: string;
  tone: FeedbackTone;
}

const FEEDBACK: Partial<Record<ExecutionEventType, VisualFeedback>> = {
  COMPARE: {
    label: "Comparing",
    message: "The algorithm is checking a relationship before deciding what to do.",
    tone: "info",
  },
  SWAP: { label: "Swapping", message: "The compared values changed positions.", tone: "info" },
  WRITE: {
    label: "Writing",
    message: "The current state is being updated with a new value.",
    tone: "info",
  },
  VISIT: {
    label: "Visiting",
    message: "This node is now part of the traversal's processed state.",
    tone: "info",
  },
  RELAX: {
    label: "Relaxing",
    message: "A path estimate is being tested against a better known route.",
    tone: "info",
  },
  FOUND: { label: "Found", message: "The requested target has been reached.", tone: "success" },
  NOT_FOUND: {
    label: "Not found",
    message: "The execution finished without locating the requested target.",
    tone: "warning",
  },
  MARK_SORTED: {
    label: "Sorted",
    message: "This element has reached its confirmed sorted position.",
    tone: "success",
  },
  BACKTRACK: {
    label: "Backtracking",
    message: "The algorithm is returning from the current search path.",
    tone: "info",
  },
  COMPLETE: {
    label: "Complete",
    message: "The canonical execution trace has reached its final step.",
    tone: "success",
  },
};

export function getVisualFeedback(event: ExecutionEventType): VisualFeedback {
  return (
    FEEDBACK[event] ?? {
      label: event.replaceAll("_", " "),
      message: "The algorithm advanced to the next canonical execution state.",
      tone: "neutral",
    }
  );
}

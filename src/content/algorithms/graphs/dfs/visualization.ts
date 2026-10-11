export const visualization = {
  type: "graph",
  states: ["currentNode", "visitedNodes", "recursionStack", "traversalOrder"],
  events: ["VISIT", "DISCOVER", "BACKTRACK", "COMPLETE"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

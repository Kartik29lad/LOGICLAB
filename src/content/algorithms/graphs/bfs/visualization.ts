export const visualization = {
  type: "graph",
  states: ["currentNode", "visitedNodes", "queue", "predecessors", "distances"],
  events: ["ENQUEUE", "DEQUEUE", "VISIT", "DISCOVER", "COMPLETE"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

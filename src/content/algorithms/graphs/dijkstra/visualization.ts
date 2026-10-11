export const visualization = {
  type: "graph",
  states: ["currentNode", "visitedNodes", "distances", "predecessors", "finalPath"],
  events: ["SET_CURRENT", "RELAX", "VISIT", "UPDATE_DISTANCE", "COMPLETE"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

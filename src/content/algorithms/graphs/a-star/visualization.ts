export const visualization = {
  type: "graph",
  states: ["currentNode", "frontier", "gScores", "fScores", "predecessors", "finalPath"],
  events: ["SET_CURRENT", "RELAX", "UPDATE_DISTANCE", "VISIT", "FOUND", "NOT_FOUND", "COMPLETE"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

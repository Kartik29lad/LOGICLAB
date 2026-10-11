export const visualization = {
  type: "graph",
  states: ["nodes", "edges", "currentNode", "neighbors"],
  events: ["INSERT", "READ", "SET_CURRENT"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

export const visualization = {
  type: "tree",
  states: ["treeNodes", "currentNode", "searchPath"],
  events: ["COMPARE", "VISIT", "INSERT", "FOUND", "NOT_FOUND"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

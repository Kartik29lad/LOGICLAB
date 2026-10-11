export const visualization = {
  type: "tree",
  states: ["currentNode", "characterPath", "isWord"],
  events: ["VISIT", "INSERT", "READ", "FOUND", "NOT_FOUND"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

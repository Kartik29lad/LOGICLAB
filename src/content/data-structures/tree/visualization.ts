export const visualization = {
  type: "tree",
  states: ["nodes", "root", "parentChildLinks", "currentNode"],
  events: ["INSERT", "VISIT", "SET_CURRENT"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

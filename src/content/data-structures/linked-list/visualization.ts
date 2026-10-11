export const visualization = {
  type: "linked-list",
  states: ["nodes", "head", "currentNode"],
  events: ["INSERT", "REMOVE", "READ", "SET_CURRENT"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

export const visualization = {
  type: "array",
  states: ["currentIndex", "target", "checkedIndexes", "result"],
  events: ["SET_CURRENT", "COMPARE", "FOUND", "NOT_FOUND", "COMPLETE"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

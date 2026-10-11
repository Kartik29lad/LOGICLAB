export const visualization = {
  type: "array",
  states: ["arrayValues", "sortedIndexes", "minimumIndex"],
  events: ["COMPARE", "SET_CURRENT", "SWAP", "COMPLETE"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

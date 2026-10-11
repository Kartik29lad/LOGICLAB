export const visualization = {
  type: "array",
  states: ["activeIndexes", "sortedIndexes", "arrayValues"],
  events: ["COMPARE", "SWAP", "SET_CURRENT", "COMPLETE"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

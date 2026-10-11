export const visualization = {
  type: "array",
  states: ["arrayValues", "heapBoundary", "rootIndex", "sortedIndexes"],
  events: ["HEAPIFY", "SWAP", "COMPARE", "SET_CURRENT", "COMPLETE"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

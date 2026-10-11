export const visualization = {
  type: "array",
  states: ["arrayValues", "pivotIndex", "activeRange", "partitionBoundary"],
  events: ["SET_CURRENT", "PARTITION", "COMPARE", "SWAP", "COMPLETE"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

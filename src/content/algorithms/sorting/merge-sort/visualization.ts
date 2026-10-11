export const visualization = {
  type: "array",
  states: ["arrayValues", "activeRange", "mergeRange"],
  events: ["SPLIT", "COMPARE", "WRITE", "MERGE", "COMPLETE"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

export const visualization = {
  type: "array",
  states: ["heapValues", "activeIndex", "heapBoundary"],
  events: ["PUSH", "POP", "COMPARE", "SWAP", "COMPLETE"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

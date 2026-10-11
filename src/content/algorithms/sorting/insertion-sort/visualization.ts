export const visualization = {
  type: "array",
  states: ["arrayValues", "sortedPrefix", "activeIndex"],
  events: ["SET_CURRENT", "COMPARE", "WRITE", "COMPLETE"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

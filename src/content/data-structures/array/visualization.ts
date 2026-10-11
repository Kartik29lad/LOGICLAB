export const visualization = {
  type: "array",
  states: ["arrayValues", "activeIndex"],
  events: ["READ", "WRITE", "SET_CURRENT"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

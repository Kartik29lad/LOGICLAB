export const visualization = {
  type: "array",
  states: ["low", "high", "mid", "target", "result"],
  events: ["SET_CURRENT", "COMPARE", "NARROW_RANGE", "FOUND", "NOT_FOUND", "COMPLETE"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

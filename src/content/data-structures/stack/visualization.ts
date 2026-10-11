export const visualization = {
  type: "stack",
  states: ["stackValues", "topIndex"],
  events: ["PUSH", "POP", "READ", "COMPLETE"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

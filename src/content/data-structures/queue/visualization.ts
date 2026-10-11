export const visualization = {
  type: "queue",
  states: ["queueValues", "frontIndex", "backIndex"],
  events: ["ENQUEUE", "DEQUEUE", "READ", "COMPLETE"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

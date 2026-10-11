export const visualization = {
  type: "hash-table",
  states: ["buckets", "activeBucket", "activeKey"],
  events: ["HASH", "READ", "WRITE", "INSERT", "REMOVE"],
  notes: [
    "Visual state is derived from execution events; presentation styling belongs to later renderer phases.",
  ],
};

export const examples = [
  {
    id: "linked-list-basic",
    title: "Basic example",
    description: "A sequence of nodes connected through next references.",
    input: {
      description: "representative input",
    },
    output: "The updated node chain.",
    explanation: "Store each value in a node that points to the next node.",
  },
  {
    id: "linked-list-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];

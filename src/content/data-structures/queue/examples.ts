export const examples = [
  {
    id: "queue-basic",
    title: "Basic example",
    description: "A FIFO collection where the earliest enqueued item is removed first.",
    input: {
      description: "representative input",
    },
    output: "The current queue contents and optional dequeued value.",
    explanation: "Add items at the back and remove items from the front.",
  },
  {
    id: "queue-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];

import type { CodeReference } from "../../schema/content-types";

export const code: CodeReference[] = [
  {
    language: "typescript",
    entryPoint: "stack",
    source:
      "/**\n * LIFO (Last-In, First-Out) Stack Data Structure.\n */\nexport class Stack<T> {\n  private elements: T[] = [];\n\n  constructor(initialElements: readonly T[] = []) {\n    this.elements = [...initialElements];\n  }\n\n  public push(item: T): void {\n    this.elements.push(item);\n  }\n\n  public pop(): T | undefined {\n    return this.elements.pop();\n  }\n\n  public peek(): T | undefined {\n    return this.elements[this.elements.length - 1];\n  }\n\n  public isEmpty(): boolean {\n    return this.elements.length === 0;\n  }\n\n  public size(): number {\n    return this.elements.length;\n  }\n\n  public clear(): void {\n    this.elements = [];\n  }\n\n  public toArray(): T[] {\n    return [...this.elements];\n  }\n}\n",
    stepMappings: [{ action: "MAIN", startLine: 1, endLine: 39 }],
  },
];

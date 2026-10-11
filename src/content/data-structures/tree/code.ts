import type { CodeReference } from "../../schema/content-types";

export const code: CodeReference[] = [
  {
    language: "typescript",
    entryPoint: "tree",
    source:
      "export class TreeNode<T> {\n  public readonly children: TreeNode<T>[] = [];\n  public constructor(public readonly value: T) {}\n}\n\nexport class Tree<T> {\n  public root: TreeNode<T> | null = null;\n\n  public setRoot(value: T): TreeNode<T> { this.root = new TreeNode(value); return this.root; }\n  public addChild(parent: TreeNode<T>, value: T): TreeNode<T> { const child = new TreeNode(value); parent.children.push(child); return child; }\n  public toValues(): T[] {\n    if (!this.root) return [];\n    const values: T[] = [];\n    const queue: TreeNode<T>[] = [this.root];\n    while (queue.length) { const node = queue.shift()!; values.push(node.value); queue.push(...node.children); }\n    return values;\n  }\n}\n",
    stepMappings: [{ action: "MAIN", startLine: 1, endLine: 19 }],
  },
];

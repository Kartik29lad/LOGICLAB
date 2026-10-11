export class TreeNode<T> {
  public readonly children: TreeNode<T>[] = [];
  public constructor(public readonly value: T) {}
}

export class Tree<T> {
  public root: TreeNode<T> | null = null;

  public setRoot(value: T): TreeNode<T> {
    this.root = new TreeNode(value);
    return this.root;
  }
  public addChild(parent: TreeNode<T>, value: T): TreeNode<T> {
    const child = new TreeNode(value);
    parent.children.push(child);
    return child;
  }
  public toValues(): T[] {
    if (!this.root) return [];
    const values: T[] = [];
    const queue: TreeNode<T>[] = [this.root];
    while (queue.length) {
      const node = queue.shift()!;
      values.push(node.value);
      queue.push(...node.children);
    }
    return values;
  }
}

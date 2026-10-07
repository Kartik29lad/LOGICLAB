export class BSTNode {
  constructor(
    public value: number,
    public left: BSTNode | null = null,
    public right: BSTNode | null = null
  ) {}
}

/**
 * Binary Search Tree data structure.
 */
export class BinarySearchTree {
  public root: BSTNode | null = null;
  private count = 0;

  public insert(value: number): void {
    const newNode = new BSTNode(value);
    if (!this.root) {
      this.root = newNode;
      this.count++;
      return;
    }

    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          this.count++;
          break;
        }
        current = current.left;
      } else if (value > current.value) {
        if (!current.right) {
          current.right = newNode;
          this.count++;
          break;
        }
        current = current.right;
      } else {
        // Disallow duplicate values in standard BST
        break;
      }
    }
  }

  public search(value: number): BSTNode | null {
    let current = this.root;
    while (current) {
      if (value === current.value) return current;
      if (value < current.value) {
        current = current.left;
      } else {
        current = current.right;
      }
    }
    return null;
  }

  public min(): number | null {
    if (!this.root) return null;
    let current = this.root;
    while (current.left) {
      current = current.left;
    }
    return current.value;
  }

  public max(): number | null {
    if (!this.root) return null;
    let current = this.root;
    while (current.right) {
      current = current.right;
    }
    return current.value;
  }

  public inOrder(): number[] {
    const result: number[] = [];
    function traverse(node: BSTNode | null): void {
      if (!node) return;
      traverse(node.left);
      result.push(node.value);
      traverse(node.right);
    }
    traverse(this.root);
    return result;
  }

  public preOrder(): number[] {
    const result: number[] = [];
    function traverse(node: BSTNode | null): void {
      if (!node) return;
      result.push(node.value);
      traverse(node.left);
      traverse(node.right);
    }
    traverse(this.root);
    return result;
  }

  public postOrder(): number[] {
    const result: number[] = [];
    function traverse(node: BSTNode | null): void {
      if (!node) return;
      traverse(node.left);
      traverse(node.right);
      result.push(node.value);
    }
    traverse(this.root);
    return result;
  }

  public size(): number {
    return this.count;
  }
}

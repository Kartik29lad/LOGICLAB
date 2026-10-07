export type Comparator<T> = (a: T, b: T) => number;

/**
 * Binary Heap (Priority Queue) with customizable comparator.
 */
export class BinaryHeap<T> {
  protected items: T[] = [];

  constructor(
    protected compare: Comparator<T> = (a, b) =>
      (a as unknown as number) < (b as unknown as number) ? -1 : 1
  ) {}

  public push(value: T): void {
    this.items.push(value);
    this.bubbleUp(this.items.length - 1);
  }

  public pop(): T | undefined {
    if (this.items.length === 0) return undefined;
    const top = this.items[0];
    const bottom = this.items.pop()!;

    if (this.items.length > 0) {
      this.items[0] = bottom;
      this.bubbleDown(0);
    }
    return top;
  }

  public peek(): T | undefined {
    return this.items[0];
  }

  public size(): number {
    return this.items.length;
  }

  public isEmpty(): boolean {
    return this.items.length === 0;
  }

  public toArray(): T[] {
    return [...this.items];
  }

  private bubbleUp(index: number): void {
    let current = index;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.compare(this.items[current]!, this.items[parent]!) < 0) {
        const temp = this.items[current]!;
        this.items[current] = this.items[parent]!;
        this.items[parent] = temp;
        current = parent;
      } else {
        break;
      }
    }
  }

  private bubbleDown(index: number): void {
    let current = index;
    const length = this.items.length;

    while (true) {
      const left = 2 * current + 1;
      const right = 2 * current + 2;
      let target = current;

      if (left < length && this.compare(this.items[left]!, this.items[target]!) < 0) {
        target = left;
      }
      if (right < length && this.compare(this.items[right]!, this.items[target]!) < 0) {
        target = right;
      }

      if (target !== current) {
        const temp = this.items[current]!;
        this.items[current] = this.items[target]!;
        this.items[target] = temp;
        current = target;
      } else {
        break;
      }
    }
  }
}

export class MinHeap extends BinaryHeap<number> {
  constructor() {
    super((a, b) => a - b);
  }
}

export class MaxHeap extends BinaryHeap<number> {
  constructor() {
    super((a, b) => b - a);
  }
}

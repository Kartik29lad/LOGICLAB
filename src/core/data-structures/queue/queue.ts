/**
 * FIFO (First-In, First-Out) Queue Data Structure.
 */
export class Queue<T> {
  private elements: T[] = [];

  constructor(initialElements: readonly T[] = []) {
    this.elements = [...initialElements];
  }

  public enqueue(item: T): void {
    this.elements.push(item);
  }

  public dequeue(): T | undefined {
    return this.elements.shift();
  }

  public peek(): T | undefined {
    return this.elements[0];
  }

  public isEmpty(): boolean {
    return this.elements.length === 0;
  }

  public size(): number {
    return this.elements.length;
  }

  public clear(): void {
    this.elements = [];
  }

  public toArray(): T[] {
    return [...this.elements];
  }
}

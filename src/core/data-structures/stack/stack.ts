/**
 * LIFO (Last-In, First-Out) Stack Data Structure.
 */
export class Stack<T> {
  private elements: T[] = [];

  constructor(initialElements: readonly T[] = []) {
    this.elements = [...initialElements];
  }

  public push(item: T): void {
    this.elements.push(item);
  }

  public pop(): T | undefined {
    return this.elements.pop();
  }

  public peek(): T | undefined {
    return this.elements[this.elements.length - 1];
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

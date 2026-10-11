export class ArrayStructure<T> {
  private readonly values: T[];

  public constructor(values: readonly T[] = []) {
    this.values = [...values];
  }
  public get length(): number {
    return this.values.length;
  }
  public get(index: number): T | undefined {
    return this.values[index];
  }
  public set(index: number, value: T): void {
    if (index < 0 || index >= this.values.length)
      throw new RangeError("Array index out of bounds.");
    this.values[index] = value;
  }
  public push(value: T): void {
    this.values.push(value);
  }
  public pop(): T | undefined {
    return this.values.pop();
  }
  public toArray(): T[] {
    return [...this.values];
  }
}

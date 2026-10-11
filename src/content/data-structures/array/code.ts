import type { CodeReference } from "../../schema/content-types";

export const code: CodeReference[] = [
  {
    language: "typescript",
    entryPoint: "array",
    source:
      'export class ArrayStructure<T> {\n  private readonly values: T[];\n\n  public constructor(values: readonly T[] = []) { this.values = [...values]; }\n  public get length(): number { return this.values.length; }\n  public get(index: number): T | undefined { return this.values[index]; }\n  public set(index: number, value: T): void { if (index < 0 || index >= this.values.length) throw new RangeError("Array index out of bounds."); this.values[index] = value; }\n  public push(value: T): void { this.values.push(value); }\n  public pop(): T | undefined { return this.values.pop(); }\n  public toArray(): T[] { return [...this.values]; }\n}\n',
    stepMappings: [{ action: "MAIN", startLine: 1, endLine: 12 }],
  },
];

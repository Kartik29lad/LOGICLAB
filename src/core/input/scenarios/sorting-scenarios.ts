import { ArrayGenerator } from "../generators/array-generator";

export interface EducationalScenario {
  id: string;
  name: string;
  description: string;
  data: number[];
}

export class SortingScenarios {
  public static getAll(): EducationalScenario[] {
    return [
      {
        id: "random-distribution",
        name: "Random Distribution",
        description: "Unordered values demonstrating general average-case performance.",
        data: ArrayGenerator.random(15, 10, 99, 1337),
      },
      {
        id: "nearly-sorted",
        name: "Nearly Sorted",
        description:
          "Demonstrates algorithms that take advantage of existing order (e.g. Insertion Sort O(n)).",
        data: ArrayGenerator.nearlySorted(15, 2, 42),
      },
      {
        id: "strictly-reversed",
        name: "Reversed Order",
        description:
          "Worst-case scenario for quadratic sorting algorithms like Bubble and Insertion Sort.",
        data: ArrayGenerator.reversed(15, 90, 5),
      },
      {
        id: "many-duplicates",
        name: "Few Unique Elements",
        description: "Tests handling of equal keys and algorithm stability.",
        data: ArrayGenerator.withDuplicates(15, 4, 777),
      },
      {
        id: "already-sorted",
        name: "Already Sorted",
        description: "Validates early termination behavior in adaptive algorithms.",
        data: ArrayGenerator.sorted(15, 5, 5),
      },
    ];
  }

  public static getById(id: string): EducationalScenario | undefined {
    return this.getAll().find((s) => s.id === id);
  }
}

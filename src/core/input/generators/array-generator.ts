import { SeededRandom } from "../random/seeded-random";

export class ArrayGenerator {
  /**
   * Generates a completely random integer array.
   */
  public static random(length = 20, min = 5, max = 100, seed = 1337): number[] {
    const rng = new SeededRandom(seed);
    const result: number[] = [];
    for (let i = 0; i < length; i++) {
      result.push(rng.nextInt(min, max));
    }
    return result;
  }

  /**
   * Generates a strictly ascending sorted array.
   */
  public static sorted(length = 20, start = 5, step = 4): number[] {
    const result: number[] = [];
    for (let i = 0; i < length; i++) {
      result.push(start + i * step);
    }
    return result;
  }

  /**
   * Generates a strictly descending reversed array.
   */
  public static reversed(length = 20, start = 100, step = 4): number[] {
    const result: number[] = [];
    for (let i = 0; i < length; i++) {
      result.push(start - i * step);
    }
    return result;
  }

  /**
   * Generates a sorted array with a small number of perturbed swaps.
   */
  public static nearlySorted(length = 20, swaps = 2, seed = 1337): number[] {
    const result = this.sorted(length);
    const rng = new SeededRandom(seed);

    for (let s = 0; s < swaps; s++) {
      const i = rng.nextInt(0, length - 1);
      const j = rng.nextInt(0, length - 1);
      const temp = result[i]!;
      result[i] = result[j]!;
      result[j] = temp;
    }
    return result;
  }

  /**
   * Generates an array containing many duplicate elements from a limited value pool.
   */
  public static withDuplicates(length = 20, poolSize = 4, seed = 1337): number[] {
    const rng = new SeededRandom(seed);
    const pool = [10, 25, 50, 75, 90].slice(0, poolSize);
    const result: number[] = [];

    for (let i = 0; i < length; i++) {
      result.push(pool[rng.nextInt(0, pool.length - 1)]!);
    }
    return result;
  }
}

import { describe, expect, it } from "vitest";

import { ArrayGenerator } from "../../../src/core/input/generators/array-generator";
import { SeededRandom } from "../../../src/core/input/random/seeded-random";

describe("Phase 5: Seeded PRNG & Input Generation", () => {
  it("generates deterministic pseudo-random sequences for identical seeds", () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(42);

    const seq1 = [rng1.next(), rng1.next(), rng1.next()];
    const seq2 = [rng2.next(), rng2.next(), rng2.next()];

    expect(seq1).toEqual(seq2);
  });

  it("generates numbers within requested integer range", () => {
    const rng = new SeededRandom(999);
    for (let i = 0; i < 50; i++) {
      const val = rng.nextInt(10, 20);
      expect(val).toBeGreaterThanOrEqual(10);
      expect(val).toBeLessThanOrEqual(20);
    }
  });

  it("generates arrays matching requested presets", () => {
    const randomArr = ArrayGenerator.random(10, 5, 50, 123);
    expect(randomArr).toHaveLength(10);

    const sortedArr = ArrayGenerator.sorted(8, 10, 5);
    expect(sortedArr).toEqual([10, 15, 20, 25, 30, 35, 40, 45]);

    const reversedArr = ArrayGenerator.reversed(5, 50, 10);
    expect(reversedArr).toEqual([50, 40, 30, 20, 10]);

    const nearlySorted = ArrayGenerator.nearlySorted(10, 1, 42);
    expect(nearlySorted).toHaveLength(10);

    const dupes = ArrayGenerator.withDuplicates(12, 3, 42);
    expect(dupes).toHaveLength(12);
  });
});

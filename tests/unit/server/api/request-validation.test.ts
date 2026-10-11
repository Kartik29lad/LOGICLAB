import { describe, expect, it } from "vitest";

import { assertObject, readStringArray } from "../../../../src/server/api/request-validation";

describe("request validation", () => {
  it("rejects non-object JSON bodies", () => expect(() => assertObject([])).toThrow());
  it("bounds string arrays", () =>
    expect(() =>
      readStringArray({ algorithms: ["a", "b", "c"] }, "algorithms", { max: 2 })
    ).toThrow());
});

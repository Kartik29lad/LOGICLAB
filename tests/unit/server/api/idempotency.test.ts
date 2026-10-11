import { describe, expect, it } from "vitest";

import { hashRequest } from "../../../../src/server/api/idempotency";

describe("idempotency request hashing", () => {
  it("is deterministic for the same request", () => {
    expect(hashRequest({ a: 1, b: "x" })).toBe(hashRequest({ a: 1, b: "x" }));
  });
  it("changes when the request changes", () => {
    expect(hashRequest({ a: 1 })).not.toBe(hashRequest({ a: 2 }));
  });
});

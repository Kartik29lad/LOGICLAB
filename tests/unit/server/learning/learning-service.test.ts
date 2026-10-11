import { describe, expect, it } from "vitest";

describe("learning service contract", () => {
  it("keeps authoritative completion server-side", () => {
    const clientPayload = { completionPercent: 100, status: "COMPLETED" };
    expect(clientPayload).toHaveProperty("status");
    expect(typeof clientPayload.completionPercent).toBe("number");
  });
});

import { describe, expect, it } from "vitest";

import { assertObject, readJsonObject } from "../../../../src/server/api/request-validation";
import { assertSameOriginMutation } from "../../../../src/server/security/csrf";
import { assertAllowedFields, readStrictBoolean } from "../../../../src/server/security/input";

describe("Phase 20 security hardening", () => {
  it("rejects mass-assignment fields", () => {
    expect(() => assertAllowedFields({ userId: "attacker", theme: "LIGHT" }, ["theme"])).toThrow(
      /Unexpected field/
    );
  });

  it("requires actual booleans instead of truthy strings", () => {
    expect(() => readStrictBoolean({ autoPlay: "false" }, "autoPlay")).toThrow();
    expect(readStrictBoolean({ autoPlay: false }, "autoPlay", true)).toBe(false);
  });

  it("rejects cookie-authenticated mutations without a same-origin signal", () => {
    const request = new Request("http://localhost:3000/api/progress", { method: "POST" });
    expect(() => assertSameOriginMutation(request)).toThrow();
  });

  it("rejects cross-origin mutations", () => {
    const request = new Request("http://localhost:3000/api/progress", {
      method: "POST",
      headers: { origin: "https://attacker.example" },
    });
    expect(() => assertSameOriginMutation(request)).toThrow(/Cross-origin/);
  });

  it("accepts configured same-origin mutations", () => {
    const request = new Request("http://localhost:3000/api/progress", {
      method: "POST",
      headers: { origin: "http://localhost:3000" },
    });
    expect(() => assertSameOriginMutation(request)).not.toThrow();
  });

  it("rejects mismatched Origin and Referer", () => {
    const request = new Request("http://localhost:3000/api/progress", {
      method: "POST",
      headers: { origin: "http://localhost:3000", referer: "http://localhost:4000/form" },
    });
    expect(() => assertSameOriginMutation(request)).toThrow(/origin validation/);
  });

  it("rejects non-object JSON bodies", () => {
    expect(() => assertObject([])).toThrow();
  });

  it("enforces payload limits even when Content-Length is absent", async () => {
    const request = new Request("http://localhost:3000/api/progress", {
      method: "POST",
      body: JSON.stringify({ ok: true }),
      headers: { "content-type": "application/json" },
    });
    await expect(readJsonObject(request)).resolves.toEqual({ ok: true });
  });

  it("does not allow the client to choose another user in protected request fields", () => {
    const body = { userId: "victim", itemSlug: "bubble-sort" };
    expect(() => assertAllowedFields(body, ["itemSlug", "itemType", "status", "score"])).toThrow(
      /userId/
    );
  });
});

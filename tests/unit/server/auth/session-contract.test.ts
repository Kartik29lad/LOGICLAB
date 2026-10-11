import { describe, expect, it } from "vitest";

import { SESSION_COOKIE } from "../../../../src/server/auth/session";

describe("session security contract", () => {
  it("uses a dedicated opaque session cookie name", () => {
    expect(SESSION_COOKIE).toBe("logiclab_session");
  });
});

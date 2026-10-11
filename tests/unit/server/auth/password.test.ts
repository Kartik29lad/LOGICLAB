import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "../../../../src/server/auth/password";

describe("password hashing", () => {
  it("hashes and verifies without storing the plaintext", async () => {
    const password = "Correct Horse Battery Staple 123";
    const encoded = await hashPassword(password);
    expect(encoded).toMatch(/^scrypt\$/);
    expect(encoded).not.toContain(password);
    await expect(verifyPassword(password, encoded)).resolves.toBe(true);
    await expect(verifyPassword("wrong password", encoded)).resolves.toBe(false);
  });

  it("uses a different salt for repeated passwords", async () => {
    const first = await hashPassword("same password 123");
    const second = await hashPassword("same password 123");
    expect(first).not.toBe(second);
  });
});

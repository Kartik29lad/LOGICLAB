import { beforeEach, describe, expect, it, vi } from "vitest";

import { enforceRateLimit } from "../../../../src/server/api/rate-limit";

const { executeQuery } = vi.hoisted(() => ({ executeQuery: vi.fn() }));
vi.mock("../../../../src/server/database/connection", () => ({ executeQuery }));

beforeEach(() => executeQuery.mockReset());

describe("rate limiter", () => {
  it("allows requests under the configured threshold", async () => {
    executeQuery.mockResolvedValueOnce([{ RequestCount: 1 }]);
    await expect(enforceRateLimit("key-1", 5, 60_000)).resolves.toBeUndefined();
  });

  it("blocks requests after the configured threshold", async () => {
    executeQuery.mockResolvedValueOnce([{ RequestCount: 2 }]);
    await expect(enforceRateLimit("key-2", 1, 60_000)).rejects.toThrow(
      "Too many requests. Please try again later."
    );
  });
});

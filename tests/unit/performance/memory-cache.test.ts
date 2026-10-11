import { describe, expect, it, vi } from "vitest";

import { MemoryCache } from "@/server/api/cache/memory-cache";

describe("MemoryCache performance contract", () => {
  it("returns values before TTL expiry and misses after expiry", () => {
    vi.useFakeTimers();
    try {
      const cache = new MemoryCache();
      cache.set("content:test:v1", { value: 1 }, 1000);
      expect(cache.get<{ value: number }>("content:test:v1")).toEqual({ value: 1 });
      vi.advanceTimersByTime(1001);
      expect(cache.get("content:test:v1")).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it("supports prefix invalidation without touching unrelated keys", () => {
    const cache = new MemoryCache();
    cache.set("content:algorithm:a:v1", "a", 1000);
    cache.set("content:algorithm:b:v1", "b", 1000);
    cache.set("content:data-structure:a:v1", "structure", 1000);
    cache.clearPrefix("content:algorithm:");
    expect(cache.get("content:algorithm:a:v1")).toBeUndefined();
    expect(cache.get("content:algorithm:b:v1")).toBeUndefined();
    expect(cache.get("content:data-structure:a:v1")).toBe("structure");
  });
});

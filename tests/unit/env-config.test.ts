import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { parseEnvironment, resetEnvironmentCache } from "../../src/config/env";
import { FEATURE_FLAGS, isFeatureFlagEnabled } from "../../src/config/feature-flags";

describe("Phase 4: Environment & Feature Flags", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    resetEnvironmentCache();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetEnvironmentCache();
  });

  it("parses development environment defaults correctly", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";
    const env = parseEnvironment();

    expect(env.nodeEnv).toBe("development");
    expect(env.isDevelopment).toBe(true);
    expect(env.isProduction).toBe(false);
    expect(env.port).toBe(3000);
    expect(env.database.name).toBe("LogicLab_Development");
    expect(env.limits.maxExecutionSteps).toBe(10000);
  });

  it("throws fail-fast error when production runs with development secret", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    delete process.env.SESSION_SECRET;

    expect(() => parseEnvironment()).toThrow(
      "[SECURITY CONFIG ERROR] Insecure SESSION_SECRET cannot be used in production."
    );
  });

  it("respects feature flag default values", () => {
    expect(isFeatureFlagEnabled("ENABLE_WEB_WORKER_EXECUTION")).toBe(true);
    expect(isFeatureFlagEnabled("ENABLE_COMMUNITY_CHALLENGES")).toBe(false);
  });

  it("evaluates feature flag environment overrides", () => {
    expect(isFeatureFlagEnabled("ENABLE_ADVANCED_BENCHMARKS", "development")).toBe(true);
    expect(isFeatureFlagEnabled("ENABLE_ADVANCED_BENCHMARKS", "production")).toBe(false);
  });

  it("allows environment variable override for feature flags", () => {
    process.env.FEATURE_ENABLE_COMMUNITY_CHALLENGES = "true";
    expect(isFeatureFlagEnabled("ENABLE_COMMUNITY_CHALLENGES")).toBe(true);
  });

  it("contains valid metadata for all registered feature flags", () => {
    for (const flag of Object.values(FEATURE_FLAGS)) {
      expect(flag.key).toBeDefined();
      expect(flag.owner).toBeDefined();
      expect(flag.targetRemovalDate).toBeDefined();
    }
  });
});

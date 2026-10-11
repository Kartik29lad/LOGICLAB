import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { parseEnvironment, resetEnvironmentCache } from "../../src/config/env";
import { FEATURE_FLAGS, isFeatureFlagEnabled } from "../../src/config/feature-flags";

describe("Phase 4: Environment & Feature Flags", () => {
  const originalEnv = process.env;

  const setNodeEnv = (val: string) => {
    (process.env as Record<string, string | undefined>).NODE_ENV = val;
  };

  beforeEach(() => {
    process.env = { ...originalEnv };
    resetEnvironmentCache();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetEnvironmentCache();
  });

  it("parses development environment defaults correctly", () => {
    setNodeEnv("development");
    const env = parseEnvironment();

    expect(env.nodeEnv).toBe("development");
    expect(env.isDevelopment).toBe(true);
    expect(env.isProduction).toBe(false);
    expect(env.isStaging).toBe(false);
    expect(env.port).toBe(3000);
    expect(env.appUrl).toBe("http://localhost:3000");
    expect(env.database.name).toBe("LogicLab_Development");
    expect(env.database.authMode).toBe("sql");
    expect(env.limits.maxExecutionSteps).toBe(10000);
  });

  it("rejects unknown NODE_ENV values instead of silently falling back", () => {
    setNodeEnv("invalid");
    expect(() => parseEnvironment()).toThrow(
      "NODE_ENV must be development, test, staging, or production"
    );
  });

  it("requires production application URL", () => {
    setNodeEnv("production");
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.SESSION_SECRET = "production-secret-that-is-at-least-32-characters";
    expect(() => parseEnvironment()).toThrow("NEXT_PUBLIC_APP_URL is required");
  });

  it("requires production database configuration", () => {
    setNodeEnv("production");
    process.env.NEXT_PUBLIC_APP_URL = "https://logiclab.example.com";
    process.env.SESSION_SECRET = "production-secret-that-is-at-least-32-characters";
    delete process.env.DB_HOST;
    expect(() => parseEnvironment()).toThrow("DB_HOST is required");
  });

  it("requires SQL credentials in staging/production", () => {
    setNodeEnv("staging");
    process.env.NEXT_PUBLIC_APP_URL = "https://staging.logiclab.example.com";
    process.env.SESSION_SECRET = "staging-secret-that-is-at-least-32-characters";
    process.env.DB_HOST = "localhost";
    process.env.DB_NAME = "LogicLab_Staging";
    process.env.DB_AUTH_MODE = "sql";
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;

    expect(() => parseEnvironment()).toThrow("SQL authentication requires DB_USER and DB_PASSWORD");
  });

  it("allows Windows Authentication without SQL credentials", () => {
    setNodeEnv("production");
    process.env.NEXT_PUBLIC_APP_URL = "https://logiclab.example.com";
    process.env.SESSION_SECRET = "production-secret-that-is-at-least-32-characters";
    process.env.DB_HOST = "sql-prod\\SQLEXPRESS";
    process.env.DB_NAME = "LogicLab";
    process.env.DB_AUTH_MODE = "windows";

    const env = parseEnvironment();
    expect(env.database.authMode).toBe("windows");
    expect(env.database.user).toBeUndefined();
    expect(env.database.password).toBeUndefined();
  });

  it("rejects weak or development session secrets outside development/test", () => {
    setNodeEnv("production");
    process.env.NEXT_PUBLIC_APP_URL = "https://logiclab.example.com";
    process.env.DB_HOST = "localhost";
    process.env.DB_NAME = "LogicLab";
    process.env.DB_AUTH_MODE = "windows";
    process.env.SESSION_SECRET = "too-short";
    expect(() => parseEnvironment()).toThrow("SESSION_SECRET must contain at least 32 characters");

    resetEnvironmentCache();
    process.env.SESSION_SECRET = "development_only_insecure_secret_key_32chars!";
    expect(() => parseEnvironment()).toThrow("Insecure SESSION_SECRET");
  });

  it("validates URL and boolean configuration values", () => {
    setNodeEnv("production");
    process.env.NEXT_PUBLIC_APP_URL = "not-a-url";
    process.env.SESSION_SECRET = "production-secret-that-is-at-least-32-characters";
    expect(() => parseEnvironment()).toThrow("NEXT_PUBLIC_APP_URL must be a valid absolute URL");

    resetEnvironmentCache();
    process.env.NEXT_PUBLIC_APP_URL = "https://logiclab.example.com";
    process.env.DB_HOST = "localhost";
    process.env.DB_NAME = "LogicLab";
    process.env.DB_AUTH_MODE = "windows";
    process.env.DB_ENCRYPT = "sometimes";
    expect(() => parseEnvironment()).toThrow("DB_ENCRYPT must be true/false or 1/0");
  });

  it("exposes typed feature flag evaluation with defaults", () => {
    expect(isFeatureFlagEnabled("enableAdvancedMetrics")).toBe(true);
    expect(isFeatureFlagEnabled("enablePredictionMode")).toBe(true);
    expect(isFeatureFlagEnabled("enableWebWorkers")).toBe(false);
    expect(FEATURE_FLAGS.enableAdvancedMetrics.defaultValue).toBe(true);
  });
});

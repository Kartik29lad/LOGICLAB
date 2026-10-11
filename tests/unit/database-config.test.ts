import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getDatabaseConfig, toMssqlConfig } from "../../src/server/database/config";

describe("Database Configuration Adapter", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.DB_AUTH_MODE = "sql";
    process.env.DB_USER = "sa";
    process.env.DB_PASSWORD = "SecretPassword123!";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("parses SQL authentication defaults", () => {
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_NAME;

    const config = getDatabaseConfig();
    expect(config.server).toBe("localhost");
    expect(config.port).toBe(1433);
    expect(config.database).toBe("LogicLab_Development");
    expect(config.authMode).toBe("sql");
    expect(config.trustServerCertificate).toBe(true);
    expect(config.encrypt).toBe(false);
  });

  it("parses named instances correctly", () => {
    process.env.DB_HOST = ".\\SQLEXPRESS";
    process.env.DB_NAME = "LogicLab_Development";

    const config = getDatabaseConfig();
    expect(config.server).toBe("localhost");
    expect(config.instanceName).toBe("SQLEXPRESS");
  });

  it("parses Windows Authentication explicitly", () => {
    process.env.DB_AUTH_MODE = "windows";
    process.env.DB_HOST = ".\\SQLEXPRESS";
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;

    const config = getDatabaseConfig();
    expect(config.authMode).toBe("windows");
    expect(config.server).toBe("localhost");
    expect(config.instanceName).toBe("SQLEXPRESS");
  });

  it("parses domain usernames for SQL authentication", () => {
    process.env.DB_USER = "ASUSTUF15\\karti";

    const config = getDatabaseConfig();
    expect(config.domain).toBe("ASUSTUF15");
    expect(config.user).toBe("karti");
  });

  it("rejects SQL authentication without credentials", () => {
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;

    expect(() => getDatabaseConfig()).toThrow(
      "SQL authentication requires DB_USER and DB_PASSWORD"
    );
  });

  it("converts SQL authentication to mssql client configuration", () => {
    process.env.DB_HOST = "localhost";
    process.env.DB_PORT = "1433";
    process.env.DB_NAME = "LogicLab_Test";

    const cfg = getDatabaseConfig();
    const mssqlConfig = toMssqlConfig(cfg);

    expect(mssqlConfig.server).toBe("localhost");
    expect(mssqlConfig.port).toBe(1433);
    expect(mssqlConfig.database).toBe("LogicLab_Test");
    expect(mssqlConfig.user).toBe("sa");
    expect(mssqlConfig.password).toBe("SecretPassword123!");
    expect(mssqlConfig.options?.trustServerCertificate).toBe(true);
  });

  it("does not silently downgrade Windows Authentication to SQL Authentication", () => {
    process.env.DB_AUTH_MODE = "windows";
    expect(() => toMssqlConfig(getDatabaseConfig())).toThrow("msnodesqlv8");
  });
});

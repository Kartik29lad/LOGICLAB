import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getDatabaseConfig, toMssqlConfig } from "../../src/server/database/config";

describe("Database Configuration Adapter", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("parses default values when no environment variables are set", () => {
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_NAME;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;

    const config = getDatabaseConfig();
    expect(config.server).toBe("localhost");
    expect(config.port).toBe(1433);
    expect(config.database).toBe("LogicLab_Development");
    expect(config.trustServerCertificate).toBe(true);
    expect(config.encrypt).toBe(false);
  });

  it("parses named instances correctly (e.g. .\\SQLEXPRESS)", () => {
    process.env.DB_HOST = ".\\SQLEXPRESS";
    process.env.DB_NAME = "LogicLab_Development";

    const config = getDatabaseConfig();
    expect(config.server).toBe("localhost");
    expect(config.instanceName).toBe("SQLEXPRESS");
    expect(config.database).toBe("LogicLab_Development");
  });

  it("parses domain username correctly (e.g. ASUSTUF15\\karti)", () => {
    process.env.DB_USER = "ASUSTUF15\\karti";

    const config = getDatabaseConfig();
    expect(config.domain).toBe("ASUSTUF15");
    expect(config.user).toBe("karti");
  });

  it("converts to mssql client configuration format", () => {
    process.env.DB_HOST = "localhost";
    process.env.DB_PORT = "1433";
    process.env.DB_NAME = "LogicLab_Test";
    process.env.DB_USER = "sa";
    process.env.DB_PASSWORD = "SecretPassword123!";

    const cfg = getDatabaseConfig();
    const mssqlConfig = toMssqlConfig(cfg);

    expect(mssqlConfig.server).toBe("localhost");
    expect(mssqlConfig.port).toBe(1433);
    expect(mssqlConfig.database).toBe("LogicLab_Test");
    expect(mssqlConfig.user).toBe("sa");
    expect(mssqlConfig.password).toBe("SecretPassword123!");
    expect(mssqlConfig.options?.trustServerCertificate).toBe(true);
  });
});

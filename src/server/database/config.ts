import type { config as SqlConfig } from "mssql";

export interface DatabaseConnectionConfig {
  server: string;
  port: number;
  database: string;
  user?: string;
  password?: string;
  domain?: string;
  instanceName?: string;
  trustServerCertificate: boolean;
  encrypt: boolean;
  pool: {
    min: number;
    max: number;
    idleTimeoutMillis: number;
  };
}

/**
 * Parses and returns the SQL Server connection configuration from environment variables.
 * Supports named instances (e.g. .\SQLEXPRESS), Windows Authentication, and standard SQL Auth.
 */
export function getDatabaseConfig(): DatabaseConnectionConfig {
  const host = process.env.DB_HOST ?? "localhost";
  const port = parseInt(process.env.DB_PORT ?? "1433", 10);
  const database = process.env.DB_NAME ?? "LogicLab_Development";
  const user = process.env.DB_USER || undefined;
  const password = process.env.DB_PASSWORD || undefined;

  let server = host;
  let instanceName: string | undefined;

  // Handle named instances like .\SQLEXPRESS or localhost\SQLEXPRESS
  if (host.includes("\\")) {
    const parts = host.split("\\");
    server = parts[0] === "." ? "localhost" : parts[0];
    instanceName = parts[1];
  }

  // Handle domain usernames if provided (e.g., ASUSTUF15\karti)
  let domain: string | undefined;
  let parsedUser = user;
  if (user && user.includes("\\")) {
    const userParts = user.split("\\");
    domain = userParts[0];
    parsedUser = userParts[1];
  }

  return {
    server,
    port: isNaN(port) ? 1433 : port,
    database,
    user: parsedUser,
    password,
    domain,
    instanceName,
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== "false",
    encrypt: process.env.DB_ENCRYPT === "true",
    pool: {
      min: parseInt(process.env.DB_POOL_MIN ?? "0", 10),
      max: parseInt(process.env.DB_POOL_MAX ?? "10", 10),
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT ?? "30000", 10),
    },
  };
}

/**
 * Converts DatabaseConnectionConfig to mssql client SqlConfig.
 */
export function toMssqlConfig(cfg: DatabaseConnectionConfig = getDatabaseConfig()): SqlConfig {
  const mssqlConfig: SqlConfig = {
    server: cfg.server,
    port: cfg.port,
    database: cfg.database,
    options: {
      encrypt: cfg.encrypt,
      trustServerCertificate: cfg.trustServerCertificate,
      enableArithAbort: true,
      instanceName: cfg.instanceName,
    },
    pool: {
      min: cfg.pool.min,
      max: cfg.pool.max,
      idleTimeoutMillis: cfg.pool.idleTimeoutMillis,
    },
  };

  if (cfg.user) {
    mssqlConfig.user = cfg.user;
  }
  if (cfg.password) {
    mssqlConfig.password = cfg.password;
  }
  if (cfg.domain) {
    mssqlConfig.domain = cfg.domain;
  }

  return mssqlConfig;
}

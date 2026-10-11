import type { config as SqlConfig } from "mssql";

export type DatabaseAuthMode = "sql" | "windows";

export interface DatabaseConnectionConfig {
  server: string;
  port: number;
  database: string;
  authMode: DatabaseAuthMode;
  user?: string;
  password?: string;
  domain?: string;
  instanceName?: string;
  trustServerCertificate: boolean;
  encrypt: boolean;
  connectionTimeoutMs: number;
  requestTimeoutMs: number;
  odbcDriver: string;
  pool: {
    min: number;
    max: number;
    idleTimeoutMillis: number;
  };
}

function parsePositiveInt(name: string, value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? String(fallback), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`[DATABASE CONFIG ERROR] ${name} must be a positive integer.`);
  }
  return parsed;
}

function parseNonNegativeInt(name: string, value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? String(fallback), 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`[DATABASE CONFIG ERROR] ${name} must be a non-negative integer.`);
  }
  return parsed;
}

function parseAuthMode(value: string | undefined): DatabaseAuthMode {
  const normalized = (value ?? "sql").trim().toLowerCase();
  if (normalized === "sql" || normalized === "windows") return normalized;
  throw new Error(`[DATABASE CONFIG ERROR] DB_AUTH_MODE must be either "sql" or "windows".`);
}

/**
 * Parses SQL Server connection settings.
 *
 * Windows Authentication is represented explicitly with DB_AUTH_MODE=windows.
 * The connection layer uses the native msnodesqlv8 driver for that mode.
 */
export function getDatabaseConfig(): DatabaseConnectionConfig {
  const host = (process.env.DB_HOST ?? "localhost").trim();
  const database = (process.env.DB_NAME ?? "LogicLab_Development").trim();
  const authMode = parseAuthMode(process.env.DB_AUTH_MODE);
  const port = parsePositiveInt("DB_PORT", process.env.DB_PORT, 1433);
  const connectionTimeoutMs = parsePositiveInt(
    "DB_CONNECTION_TIMEOUT_MS",
    process.env.DB_CONNECTION_TIMEOUT_MS,
    15000
  );
  const requestTimeoutMs = parsePositiveInt(
    "DB_REQUEST_TIMEOUT_MS",
    process.env.DB_REQUEST_TIMEOUT_MS,
    30000
  );
  const odbcDriver = (process.env.DB_ODBC_DRIVER ?? "ODBC Driver 18 for SQL Server").trim();
  if (!odbcDriver) throw new Error("[DATABASE CONFIG ERROR] DB_ODBC_DRIVER cannot be empty.");

  if (!host) throw new Error("[DATABASE CONFIG ERROR] DB_HOST is required.");
  if (!database) throw new Error("[DATABASE CONFIG ERROR] DB_NAME is required.");

  let server = host;
  let instanceName: string | undefined;

  if (host.includes("\\")) {
    const [rawServer, rawInstance, ...rest] = host.split("\\");
    if (rest.length > 0 || !rawInstance) {
      throw new Error("[DATABASE CONFIG ERROR] DB_HOST must use server\\instance format.");
    }
    server = rawServer === "." ? "localhost" : rawServer;
    instanceName = rawInstance;
  }

  const rawUser = process.env.DB_USER?.trim() || undefined;
  const password = process.env.DB_PASSWORD || undefined;
  let user = rawUser;
  let domain: string | undefined;

  if (rawUser?.includes("\\")) {
    const [rawDomain, rawUsername, ...rest] = rawUser.split("\\");
    if (rest.length > 0 || !rawDomain || !rawUsername) {
      throw new Error("[DATABASE CONFIG ERROR] DB_USER must use DOMAIN\\username format.");
    }
    domain = rawDomain;
    user = rawUsername;
  }

  const poolMin = parseNonNegativeInt("DB_POOL_MIN", process.env.DB_POOL_MIN, 0);
  const poolMax = parsePositiveInt("DB_POOL_MAX", process.env.DB_POOL_MAX, 10);
  if (poolMax < poolMin) {
    throw new Error(
      "[DATABASE CONFIG ERROR] DB_POOL_MAX must be greater than or equal to DB_POOL_MIN."
    );
  }

  if (authMode === "sql" && (!user || !password)) {
    throw new Error("[DATABASE CONFIG ERROR] SQL authentication requires DB_USER and DB_PASSWORD.");
  }

  return {
    server,
    port,
    database,
    authMode,
    user,
    password,
    domain,
    instanceName,
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== "false",
    encrypt: process.env.DB_ENCRYPT === "true",
    connectionTimeoutMs,
    requestTimeoutMs,
    odbcDriver,
    pool: {
      min: poolMin,
      max: poolMax,
      idleTimeoutMillis: parsePositiveInt(
        "DB_POOL_IDLE_TIMEOUT",
        process.env.DB_POOL_IDLE_TIMEOUT,
        30000
      ),
    },
  };
}

/**
 * Converts the normalized configuration to the default mssql/Tedious config.
 * Windows mode is intentionally rejected here because integrated Windows auth
 * requires the optional native MSNodeSQLv8 driver.
 */
export function toMssqlConfig(cfg: DatabaseConnectionConfig = getDatabaseConfig()): SqlConfig {
  if (cfg.authMode === "windows") {
    throw new Error(
      "Windows Authentication requires the optional msnodesqlv8 driver. Use the database connection factory instead of toMssqlConfig()."
    );
  }

  return {
    server: cfg.server,
    ...(cfg.instanceName ? {} : { port: cfg.port }),
    database: cfg.database,
    user: cfg.user,
    password: cfg.password,
    connectionTimeout: cfg.connectionTimeoutMs,
    requestTimeout: cfg.requestTimeoutMs,
    options: {
      encrypt: cfg.encrypt,
      trustServerCertificate: cfg.trustServerCertificate,
      enableArithAbort: true,
      ...(cfg.instanceName ? { instanceName: cfg.instanceName } : {}),
    },
    pool: cfg.pool,
  };
}

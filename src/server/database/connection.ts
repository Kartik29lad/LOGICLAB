import { createRequire } from "node:module";
import sql from "mssql";

import type { DatabaseConnectionConfig } from "./config";
import { getDatabaseConfig, toMssqlConfig } from "./config";

let globalPool: sql.ConnectionPool | null = null;

function loadNativeMssqlDriver(): typeof sql {
  try {
    const req = createRequire(import.meta.url);
    const dynamicRequire = Function("r", "m", "return r(m)");
    return dynamicRequire(req, "mssql/msnodesqlv8") as typeof sql;
  } catch {
    throw new Error(
      "Windows Authentication is configured, but the optional msnodesqlv8 driver is not installed. Install msnodesqlv8 and ensure Microsoft ODBC Driver 17/18 for SQL Server is installed on the host."
    );
  }
}

function createConfig(cfg: DatabaseConnectionConfig): sql.config {
  if (cfg.authMode === "sql") return toMssqlConfig(cfg);

  loadNativeMssqlDriver();

  return {
    server: cfg.server,
    port: cfg.port,
    database: cfg.database,
    connectionTimeout: cfg.connectionTimeoutMs,
    requestTimeout: cfg.requestTimeoutMs,
    driver: cfg.odbcDriver,
    options: {
      trustedConnection: true,
      trustServerCertificate: cfg.trustServerCertificate,
      encrypt: cfg.encrypt,
      enableArithAbort: true,
      ...(cfg.instanceName ? { instanceName: cfg.instanceName } : {}),
    },
    pool: cfg.pool,
  } as sql.config;
}

export async function getPool(): Promise<sql.ConnectionPool> {
  if (globalPool?.connected) return globalPool;

  const cfg = getDatabaseConfig();
  const sqlClient = cfg.authMode === "windows" ? loadNativeMssqlDriver() : sql;

  const pool = new sqlClient.ConnectionPool(createConfig(cfg));
  globalPool = await pool.connect();
  return globalPool;
}

export async function closePool(): Promise<void> {
  if (globalPool) {
    await globalPool.close();
    globalPool = null;
  }
}

export async function executeQuery<T = Record<string, unknown>>(
  queryText: string,
  parameters: Record<string, unknown> = {}
): Promise<T[]> {
  const pool = await getPool();
  const request = pool.request();
  for (const [key, value] of Object.entries(parameters)) request.input(key, value);
  const result = await request.query<T>(queryText);
  return result.recordset;
}

export async function withTransaction<T>(
  operation: (tx: sql.Transaction) => Promise<T>
): Promise<T> {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const result = await operation(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      // Preserve the original operation error.
    }
    throw error;
  }
}

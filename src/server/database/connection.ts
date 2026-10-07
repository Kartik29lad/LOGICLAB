import sql from "mssql";

import { getDatabaseConfig, toMssqlConfig } from "./config";

let globalPool: sql.ConnectionPool | null = null;

/**
 * Returns a connected SQL Server connection pool (singleton).
 */
export async function getPool(): Promise<sql.ConnectionPool> {
  if (globalPool && globalPool.connected) {
    return globalPool;
  }

  const mssqlConfig = toMssqlConfig(getDatabaseConfig());
  const pool = new sql.ConnectionPool(mssqlConfig);
  globalPool = await pool.connect();
  return globalPool;
}

/**
 * Closes the active SQL Server connection pool.
 */
export async function closePool(): Promise<void> {
  if (globalPool) {
    await globalPool.close();
    globalPool = null;
  }
}

/**
 * Executes a query with an optional parameter map and returns the recordset.
 */
export async function executeQuery<T = Record<string, unknown>>(
  queryText: string,
  parameters: Record<string, unknown> = {}
): Promise<T[]> {
  const pool = await getPool();
  const request = pool.request();

  for (const [key, value] of Object.entries(parameters)) {
    request.input(key, value);
  }

  const result = await request.query<T>(queryText);
  return result.recordset;
}

/**
 * Executes operations inside an ACID transaction.
 * Rolls back automatically on any thrown error and commits on success.
 */
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
    await transaction.rollback();
    throw error;
  }
}

import crypto from "crypto";
import fs from "fs";
import path from "path";
import type sql from "mssql";

import { getPool } from "./connection";

export interface MigrationRecord {
  migrationId: number;
  migrationName: string;
  batchNumber: number;
  checksum: string;
  appliedAt: Date;
}

export interface MigrationResult {
  appliedCount: number;
  appliedNames: string[];
}

/**
 * Ensures the internal migrations tracking table exists.
 */
export async function ensureMigrationTable(pool: sql.ConnectionPool): Promise<void> {
  const createTableQuery = `
    IF OBJECT_ID('dbo._Migrations', 'U') IS NULL
    BEGIN
        CREATE TABLE dbo._Migrations (
            MigrationId INT IDENTITY(1,1) CONSTRAINT PK_Migrations PRIMARY KEY,
            MigrationName NVARCHAR(255) NOT NULL CONSTRAINT UQ_Migrations_Name UNIQUE,
            BatchNumber INT NOT NULL,
            Checksum NVARCHAR(64) NOT NULL,
            AppliedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Migrations_AppliedAt DEFAULT SYSUTCDATETIME()
        );
    END;
  `;
  await pool.request().query(createTableQuery);
}

/**
 * Splits a SQL migration script into individual batches separated by 'GO' directives.
 */
export function splitSqlBatches(sqlContent: string): string[] {
  const regex = /^\s*GO\s*$/gim;
  return sqlContent
    .split(regex)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
}

/**
 * Discovers and runs all unapplied migrations from the target directory in sequential order.
 */
export async function runMigrations(
  migrationsDir = path.resolve(process.cwd(), "database/migrations")
): Promise<MigrationResult> {
  const pool = await getPool();
  await ensureMigrationTable(pool);

  const appliedResult = await pool
    .request()
    .query<{ MigrationName: string; BatchNumber: number }>(
      "SELECT MigrationName, BatchNumber FROM dbo._Migrations ORDER BY MigrationId ASC"
    );

  const appliedMap = new Set(appliedResult.recordset.map((r) => r.MigrationName));
  const currentMaxBatch = appliedResult.recordset.reduce(
    (max, r) => Math.max(max, r.BatchNumber),
    0
  );
  const nextBatch = currentMaxBatch + 1;

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const appliedNames: string[] = [];

  for (const file of files) {
    if (appliedMap.has(file)) continue;

    const filePath = path.join(migrationsDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const checksum = crypto.createHash("sha256").update(content).digest("hex");
    const batches = splitSqlBatches(content);

    const transaction = pool.transaction();
    await transaction.begin();

    try {
      for (const batch of batches) {
        await transaction.request().batch(batch);
      }

      await transaction
        .request()
        .input("name", file)
        .input("batch", nextBatch)
        .input("checksum", checksum)
        .query(
          "INSERT INTO dbo._Migrations (MigrationName, BatchNumber, Checksum) VALUES (@name, @batch, @checksum)"
        );

      await transaction.commit();
      appliedNames.push(file);
    } catch (err) {
      await transaction.rollback();
      throw new Error(`Failed to execute migration ${file}: ${(err as Error).message}`);
    }
  }

  return { appliedCount: appliedNames.length, appliedNames };
}

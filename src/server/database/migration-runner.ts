import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
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

export function computeMigrationChecksum(content: string): string {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

export async function ensureMigrationTable(pool: sql.ConnectionPool): Promise<void> {
  await pool.request().batch(`
    IF OBJECT_ID('dbo._Migrations', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo._Migrations (
        MigrationId INT IDENTITY(1,1) CONSTRAINT PK_Migrations PRIMARY KEY,
        MigrationName NVARCHAR(255) NOT NULL CONSTRAINT UQ_Migrations_Name UNIQUE,
        BatchNumber INT NOT NULL,
        Checksum NVARCHAR(64) NOT NULL,
        AppliedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Migrations_AppliedAt DEFAULT SYSUTCDATETIME()
      );
      CREATE INDEX IX_Migrations_BatchNumber ON dbo._Migrations(BatchNumber);
    END;
  `);
}

export function splitSqlBatches(sqlContent: string): string[] {
  const regex = /^\s*GO(?:\s+\d+)?\s*$/gim;
  return sqlContent
    .split(regex)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function discoverMigrationFiles(migrationsDir: string): string[] {
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migration directory does not exist: ${migrationsDir}`);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => /^\d{3}_.+\.sql$/i.test(file))
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) throw new Error(`No migration files found in ${migrationsDir}.`);

  for (let index = 1; index < files.length + 1; index += 1) {
    const expectedPrefix = `${String(index).padStart(3, "0")}_`;
    if (!files[index - 1].startsWith(expectedPrefix)) {
      throw new Error(
        `Migration sequence gap detected before ${files[index - 1]}. Expected ${expectedPrefix}*.sql.`
      );
    }
  }

  return files;
}

async function acquireMigrationLock(pool: sql.ConnectionPool): Promise<void> {
  const result = await pool.request().query<{ ResultCode: number }>(`
    DECLARE @ResultCode INT;
    EXEC @ResultCode = sp_getapplock
      @Resource = N'LogicLab.Database.Migrations',
      @LockMode = N'Exclusive',
      @LockOwner = N'Session',
      @LockTimeout = 30000;
    SELECT @ResultCode AS ResultCode;
  `);

  const code = result.recordset[0]?.ResultCode ?? -999;
  if (code < 0) throw new Error(`Unable to acquire database migration lock (code ${code}).`);
}

async function releaseMigrationLock(pool: sql.ConnectionPool): Promise<void> {
  await pool.request().query(`
    EXEC sp_releaseapplock
      @Resource = N'LogicLab.Database.Migrations',
      @LockOwner = N'Session';
  `);
}

async function validateAppliedChecksums(
  pool: sql.ConnectionPool,
  migrationsDir: string,
  files: string[]
): Promise<void> {
  const result = await pool.request().query<MigrationRecord>(`
    SELECT MigrationId, MigrationName, BatchNumber, Checksum, AppliedAt
    FROM dbo._Migrations
    ORDER BY MigrationId ASC;
  `);

  const currentFiles = new Set(files);
  for (const applied of result.recordset) {
    if (!currentFiles.has(applied.migrationName)) {
      throw new Error(
        `Migration integrity error: applied migration ${applied.migrationName} is missing from the repository.`
      );
    }

    const content = fs.readFileSync(path.join(migrationsDir, applied.migrationName), "utf8");
    const currentChecksum = computeMigrationChecksum(content);
    if (currentChecksum !== applied.checksum) {
      throw new Error(
        `Migration integrity error: ${applied.migrationName} was modified after application. ` +
          `Stored checksum=${applied.checksum}; current checksum=${currentChecksum}. ` +
          "Create a new migration instead of editing an applied migration."
      );
    }
  }
}

export async function runMigrations(
  migrationsDir = path.resolve(process.cwd(), "database/migrations")
): Promise<MigrationResult> {
  const pool = await getPool();
  await ensureMigrationTable(pool);
  await acquireMigrationLock(pool);

  try {
    const files = discoverMigrationFiles(migrationsDir);
    await validateAppliedChecksums(pool, migrationsDir, files);

    const appliedResult = await pool.request().query<MigrationRecord>(`
      SELECT MigrationId, MigrationName, BatchNumber, Checksum, AppliedAt
      FROM dbo._Migrations
      ORDER BY MigrationId ASC;
    `);
    const appliedMap = new Map(
      appliedResult.recordset.map((record) => [record.migrationName, record])
    );
    let nextBatch =
      appliedResult.recordset.reduce((max, record) => Math.max(max, record.batchNumber), 0) + 1;
    const appliedNames: string[] = [];

    for (const file of files) {
      if (appliedMap.has(file)) continue;

      const content = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      const checksum = computeMigrationChecksum(content);
      const batches = splitSqlBatches(content);
      if (batches.length === 0)
        throw new Error(`Migration ${file} contains no executable SQL batches.`);

      const transaction = pool.transaction();
      await transaction.begin();
      try {
        for (const batch of batches) await transaction.request().batch(batch);

        await transaction
          .request()
          .input("name", file)
          .input("batch", nextBatch)
          .input("checksum", checksum).query(`
            INSERT INTO dbo._Migrations (MigrationName, BatchNumber, Checksum)
            VALUES (@name, @batch, @checksum);
          `);

        await transaction.commit();
        appliedNames.push(file);
        nextBatch += 1;
      } catch (error) {
        try {
          await transaction.rollback();
        } catch {
          // Preserve the migration failure.
        }
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to execute migration ${file}: ${message}`);
      }
    }

    return { appliedCount: appliedNames.length, appliedNames };
  } finally {
    await releaseMigrationLock(pool);
  }
}

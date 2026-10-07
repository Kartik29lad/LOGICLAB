/* ============================================================
   LOGICLAB — MIGRATIONS AUDIT SCRIPT
   Inspects dbo._Migrations table and records audit log
   ============================================================ */

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

IF OBJECT_ID('dbo._Migrations', 'U') IS NOT NULL
BEGIN
    SELECT
        MigrationId,
        MigrationName,
        BatchNumber,
        Checksum,
        AppliedAt
    FROM dbo._Migrations
    ORDER BY MigrationId ASC;

    SELECT
        COUNT(*) AS TotalAppliedMigrations,
        MAX(BatchNumber) AS LatestBatch,
        MAX(AppliedAt) AS LastMigrationTimestamp
    FROM dbo._Migrations;
END
ELSE
BEGIN
    SELECT 'dbo._Migrations table does not exist yet. Run migrations first.' AS StatusNotice;
END;

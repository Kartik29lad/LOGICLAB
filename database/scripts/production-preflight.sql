/* LogicLab Phase 26 — Production Database Preflight
   Run with a controlled production/staging connection.
   This script is read-only and must complete before a production migration.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

SELECT
    DB_NAME() AS DatabaseName,
    @@SERVERNAME AS ServerName,
    SUSER_SNAME() AS LoginName,
    DB_NAME() AS CurrentDatabase,
    SYSUTCDATETIME() AS CheckedAtUtc;

IF OBJECT_ID('dbo._Migrations', 'U') IS NULL
    THROW 50001, 'LogicLab migration table dbo._Migrations is missing.', 1;

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Users' AND schema_id = SCHEMA_ID('dbo'))
    THROW 50002, 'LogicLab Users table is missing.', 1;

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ContentItems' AND schema_id = SCHEMA_ID('dbo'))
    THROW 50003, 'LogicLab ContentItems table is missing.', 1;

SELECT
    COUNT(*) AS DomainTableCount,
    (SELECT COUNT(*) FROM dbo._Migrations) AS AppliedMigrationCount,
    (SELECT MAX(BatchNumber) FROM dbo._Migrations) AS LatestMigrationBatch
FROM sys.tables
WHERE schema_id = SCHEMA_ID('dbo')
  AND name NOT LIKE '\_%' ESCAPE '\';

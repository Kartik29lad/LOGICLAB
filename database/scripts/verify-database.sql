/* LogicLab — database readiness verification */

SET NOCOUNT ON;

SELECT DB_NAME() AS DatabaseName, SUSER_SNAME() AS LoginName, @@SERVERNAME AS ServerName;

IF OBJECT_ID('dbo._Migrations', 'U') IS NULL
    THROW 51000, 'LogicLab migration registry dbo._Migrations is missing.', 1;

DECLARE @ExpectedDomainTables INT = 23;
DECLARE @ActualDomainTables INT = (
    SELECT COUNT(*)
    FROM sys.tables
    WHERE schema_id = SCHEMA_ID('dbo')
      AND name NOT LIKE '\_%' ESCAPE '\'
);

IF @ActualDomainTables < @ExpectedDomainTables
    THROW 51001, 'LogicLab domain schema is incomplete.', 1;

SELECT
    @ActualDomainTables AS DomainTableCount,
    (SELECT COUNT(*) FROM dbo._Migrations) AS AppliedMigrationCount,
    (SELECT MAX(BatchNumber) FROM dbo._Migrations) AS LatestMigrationBatch;

SELECT name AS TableName
FROM sys.tables
WHERE schema_id = SCHEMA_ID('dbo')
ORDER BY name;

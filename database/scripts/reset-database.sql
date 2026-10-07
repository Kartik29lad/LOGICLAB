/* ============================================================
   LOGICLAB — DATABASE RESET SCRIPT
   Safely drops all foreign keys and tables in dbo schema
   WARNING: THIS WIPES ALL DATA IN LOGICLAB_DEVELOPMENT / TEST DB
   ============================================================ */

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

-- 1. Drop all foreign key constraints dynamically
DECLARE @DropFkSql NVARCHAR(MAX) = N'';

SELECT @DropFkSql += N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id))
    + N'.' + QUOTENAME(OBJECT_NAME(parent_object_id))
    + N' DROP CONSTRAINT ' + QUOTENAME(name) + N';' + CHAR(13)
FROM sys.foreign_keys
WHERE schema_id = SCHEMA_ID('dbo');

IF LEN(@DropFkSql) > 0
BEGIN
    EXEC sp_executesql @DropFkSql;
END;

-- 2. Drop all dbo tables
DECLARE @DropTableSql NVARCHAR(MAX) = N'';

SELECT @DropTableSql += N'DROP TABLE ' + QUOTENAME(TABLE_SCHEMA)
    + N'.' + QUOTENAME(TABLE_NAME) + N';' + CHAR(13)
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo'
  AND TABLE_TYPE = 'BASE TABLE';

IF LEN(@DropTableSql) > 0
BEGIN
    EXEC sp_executesql @DropTableSql;
END;

PRINT 'LogicLab dbo schema reset complete. All tables and constraints removed.';

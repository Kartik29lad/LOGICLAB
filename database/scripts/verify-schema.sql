/* ============================================================
   LOGICLAB — SCHEMA VERIFICATION SCRIPT
   Validates table counts, schema objects, and constraint integrity
   ============================================================ */

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

-- 1. Table Count Verification (Expected: 24 Core Domain Tables)
SELECT
    'TABLE_COUNT' AS Metric,
    COUNT(*) AS ActualValue,
    24 AS ExpectedMinimum
FROM sys.tables
WHERE schema_id = SCHEMA_ID('dbo')
  AND name NOT LIKE '\_%' ESCAPE '\';

-- 2. Foreign Key Count
SELECT
    'FOREIGN_KEYS' AS Metric,
    COUNT(*) AS TotalCount
FROM sys.foreign_keys
WHERE schema_id = SCHEMA_ID('dbo');

-- 3. Check Constraints Count
SELECT
    'CHECK_CONSTRAINTS' AS Metric,
    COUNT(*) AS TotalCount
FROM sys.check_constraints
WHERE schema_id = SCHEMA_ID('dbo');

-- 4. Index Count
SELECT
    'INDEXES' AS Metric,
    COUNT(*) AS TotalCount
FROM sys.indexes
WHERE object_id IN (
    SELECT object_id FROM sys.tables WHERE schema_id = SCHEMA_ID('dbo')
);

-- 5. List All dbo Tables
SELECT
    t.name AS TableName,
    p.rows AS ApproxRowCount,
    t.create_date AS CreatedDate
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id AND p.index_id IN (0, 1)
WHERE t.schema_id = SCHEMA_ID('dbo')
ORDER BY t.name;

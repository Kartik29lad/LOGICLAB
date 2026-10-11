/* Phase 8: expand content identity types and guarantee one current version per item. */
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_ContentItems_ContentType' AND parent_object_id = OBJECT_ID('dbo.ContentItems'))
BEGIN
    ALTER TABLE dbo.ContentItems DROP CONSTRAINT CK_ContentItems_ContentType;
END;
ALTER TABLE dbo.ContentItems ADD CONSTRAINT CK_ContentItems_ContentType CHECK (ContentType IN ('ALGORITHM', 'DATA_STRUCTURE', 'CHALLENGE', 'LEARNING_PATH', 'CONCEPT_EXPLANATION'));
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UX_ContentVersions_Current'
      AND object_id = OBJECT_ID('dbo.ContentVersions')
)
BEGIN
    CREATE UNIQUE INDEX UX_ContentVersions_Current
        ON dbo.ContentVersions(ContentItemId)
        WHERE IsCurrent = 1;
END;

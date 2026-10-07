/* ============================================================
   LOGICLAB MIGRATION 007: Bookmarks
   Table: Bookmarks
   ============================================================ */

IF OBJECT_ID('dbo.Bookmarks', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Bookmarks
    (
        BookmarkId              UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT PK_Bookmarks PRIMARY KEY
            DEFAULT NEWSEQUENTIALID(),

        UserId                  UNIQUEIDENTIFIER NOT NULL,
        ContentItemId           UNIQUEIDENTIFIER NULL,
        ExperimentId            UNIQUEIDENTIFIER NULL,
        StepNumber              INT NULL,
        Note                    NVARCHAR(2000) NULL,

        CreatedAt               DATETIME2(3) NOT NULL
            CONSTRAINT DF_Bookmarks_CreatedAt DEFAULT SYSUTCDATETIME(),

        UpdatedAt               DATETIME2(3) NOT NULL
            CONSTRAINT DF_Bookmarks_UpdatedAt DEFAULT SYSUTCDATETIME(),

        CONSTRAINT FK_Bookmarks_Users
            FOREIGN KEY (UserId)
            REFERENCES dbo.Users(UserId)
            ON DELETE CASCADE,

        CONSTRAINT FK_Bookmarks_ContentItems
            FOREIGN KEY (ContentItemId)
            REFERENCES dbo.ContentItems(ContentItemId),

        CONSTRAINT FK_Bookmarks_Experiments
            FOREIGN KEY (ExperimentId)
            REFERENCES dbo.Experiments(ExperimentId),

        CONSTRAINT CK_Bookmarks_Target
            CHECK
            (
                (ContentItemId IS NOT NULL AND ExperimentId IS NULL)
                OR (ContentItemId IS NULL AND ExperimentId IS NOT NULL)
            ),

        CONSTRAINT CK_Bookmarks_StepNumber
            CHECK (StepNumber IS NULL OR StepNumber >= 0)
    );

    CREATE UNIQUE INDEX UX_Bookmarks_UserContentStep
    ON dbo.Bookmarks(UserId, ContentItemId, StepNumber)
    WHERE ContentItemId IS NOT NULL;

    CREATE UNIQUE INDEX UX_Bookmarks_UserExperimentStep
    ON dbo.Bookmarks(UserId, ExperimentId, StepNumber)
    WHERE ExperimentId IS NOT NULL;

    CREATE INDEX IX_Bookmarks_User ON dbo.Bookmarks(UserId);
END;

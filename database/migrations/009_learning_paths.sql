/* ============================================================
   LOGICLAB MIGRATION 009: Learning Paths Progress
   Tables: LearningPathProgress, LearningPathItemProgress
   ============================================================ */

-- 1. LEARNING PATH PROGRESS
IF OBJECT_ID('dbo.LearningPathProgress', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.LearningPathProgress
    (
        ProgressId                  UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT PK_LearningPathProgress PRIMARY KEY
            DEFAULT NEWSEQUENTIALID(),

        UserId                      UNIQUEIDENTIFIER NOT NULL,
        ContentItemId               UNIQUEIDENTIFIER NOT NULL,
        ContentType                 VARCHAR(30) NOT NULL
            CONSTRAINT DF_LearningPathProgress_ContentType DEFAULT 'LEARNING_PATH',
        ContentVersionId            UNIQUEIDENTIFIER NOT NULL,

        Status                      VARCHAR(30) NOT NULL
            CONSTRAINT DF_LearningPathProgress_Status DEFAULT 'NOT_STARTED',

        CompletionPercent           DECIMAL(5,2) NOT NULL
            CONSTRAINT DF_LearningPathProgress_Completion DEFAULT 0,

        CurrentItemContentItemId    UNIQUEIDENTIFIER NULL,
        CurrentItemContentType      VARCHAR(30) NULL,

        ItemsCompleted              INT NOT NULL
            CONSTRAINT DF_LearningPathProgress_ItemsCompleted DEFAULT 0,

        StartedAt                   DATETIME2(3) NULL,
        LastActivityAt              DATETIME2(3) NULL,
        CompletedAt                 DATETIME2(3) NULL,

        UpdatedAt                   DATETIME2(3) NOT NULL
            CONSTRAINT DF_LearningPathProgress_UpdatedAt DEFAULT SYSUTCDATETIME(),

        RowVersion                  ROWVERSION NOT NULL,

        CONSTRAINT FK_LearningPathProgress_Users
            FOREIGN KEY (UserId)
            REFERENCES dbo.Users(UserId)
            ON DELETE CASCADE,

        CONSTRAINT FK_LearningPathProgress_ContentItem
            FOREIGN KEY (ContentItemId, ContentType)
            REFERENCES dbo.ContentItems(ContentItemId, ContentType),

        CONSTRAINT FK_LearningPathProgress_ContentVersion
            FOREIGN KEY (ContentVersionId, ContentItemId)
            REFERENCES dbo.ContentVersions(ContentVersionId, ContentItemId),

        CONSTRAINT FK_LearningPathProgress_CurrentItem
            FOREIGN KEY (CurrentItemContentItemId, CurrentItemContentType)
            REFERENCES dbo.ContentItems(ContentItemId, ContentType),

        CONSTRAINT CK_LearningPathProgress_CurrentItemPair
            CHECK
            (
                (CurrentItemContentItemId IS NULL AND CurrentItemContentType IS NULL)
                OR (CurrentItemContentItemId IS NOT NULL AND CurrentItemContentType IS NOT NULL)
            ),

        CONSTRAINT CK_LearningPathProgress_ContentType
            CHECK (ContentType = 'LEARNING_PATH'),

        CONSTRAINT CK_LearningPathProgress_Status
            CHECK (Status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),

        CONSTRAINT CK_LearningPathProgress_Completion
            CHECK (CompletionPercent >= 0 AND CompletionPercent <= 100),

        CONSTRAINT CK_LearningPathProgress_ItemsCompleted
            CHECK (ItemsCompleted >= 0),

        CONSTRAINT UQ_LearningPathProgress_UserPath
            UNIQUE (UserId, ContentItemId)
    );

    CREATE INDEX IX_LearningPathProgress_UserActivity ON dbo.LearningPathProgress(UserId, LastActivityAt DESC);
    CREATE INDEX IX_LearningPathProgress_Status ON dbo.LearningPathProgress(UserId, Status);
END;

-- 2. LEARNING PATH ITEM PROGRESS
IF OBJECT_ID('dbo.LearningPathItemProgress', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.LearningPathItemProgress
    (
        ItemProgressId              UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT PK_LearningPathItemProgress PRIMARY KEY
            DEFAULT NEWSEQUENTIALID(),

        ProgressId                  UNIQUEIDENTIFIER NOT NULL,

        ItemContentItemId           UNIQUEIDENTIFIER NOT NULL,
        ItemContentType             VARCHAR(30) NOT NULL,
        ItemContentVersionId        UNIQUEIDENTIFIER NOT NULL,

        Status                      VARCHAR(30) NOT NULL
            CONSTRAINT DF_LearningPathItemProgress_Status DEFAULT 'NOT_STARTED',

        CompletionPercent           DECIMAL(5,2) NOT NULL
            CONSTRAINT DF_LearningPathItemProgress_Completion DEFAULT 0,

        StartedAt                   DATETIME2(3) NULL,
        LastActivityAt              DATETIME2(3) NULL,
        CompletedAt                 DATETIME2(3) NULL,

        UpdatedAt                   DATETIME2(3) NOT NULL
            CONSTRAINT DF_LearningPathItemProgress_UpdatedAt DEFAULT SYSUTCDATETIME(),

        RowVersion                  ROWVERSION NOT NULL,

        CONSTRAINT FK_LearningPathItemProgress_Progress
            FOREIGN KEY (ProgressId)
            REFERENCES dbo.LearningPathProgress(ProgressId)
            ON DELETE CASCADE,

        CONSTRAINT FK_LearningPathItemProgress_ContentItem
            FOREIGN KEY (ItemContentItemId, ItemContentType)
            REFERENCES dbo.ContentItems(ContentItemId, ContentType),

        CONSTRAINT FK_LearningPathItemProgress_ContentVersion
            FOREIGN KEY (ItemContentVersionId, ItemContentItemId)
            REFERENCES dbo.ContentVersions(ContentVersionId, ContentItemId),

        CONSTRAINT CK_LearningPathItemProgress_ItemType
            CHECK (ItemContentType IN ('ALGORITHM', 'DATA_STRUCTURE', 'CHALLENGE', 'LEARNING_PATH')),

        CONSTRAINT CK_LearningPathItemProgress_Status
            CHECK (Status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),

        CONSTRAINT CK_LearningPathItemProgress_Completion
            CHECK (CompletionPercent >= 0 AND CompletionPercent <= 100),

        CONSTRAINT UQ_LearningPathItemProgress_Item
            UNIQUE (ProgressId, ItemContentItemId)
    );

    CREATE INDEX IX_LearningPathItemProgress_Progress ON dbo.LearningPathItemProgress(ProgressId);
    CREATE INDEX IX_LearningPathItemProgress_Status ON dbo.LearningPathItemProgress(ProgressId, Status);
END;

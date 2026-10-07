/* ============================================================
   LOGICLAB MIGRATION 002: Learning Progress
   Tables: AlgorithmProgress, DataStructureProgress
   ============================================================ */

-- 1. ALGORITHM PROGRESS
IF OBJECT_ID('dbo.AlgorithmProgress', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.AlgorithmProgress
    (
        ProgressId              UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT PK_AlgorithmProgress PRIMARY KEY
            DEFAULT NEWSEQUENTIALID(),

        UserId                  UNIQUEIDENTIFIER NOT NULL,
        ContentItemId           UNIQUEIDENTIFIER NOT NULL,
        ContentType             VARCHAR(30) NOT NULL
            CONSTRAINT DF_AlgorithmProgress_ContentType DEFAULT 'ALGORITHM',
        ContentVersionId        UNIQUEIDENTIFIER NOT NULL,

        Status                  VARCHAR(30) NOT NULL
            CONSTRAINT DF_AlgorithmProgress_Status DEFAULT 'NOT_STARTED',

        CompletionPercent       DECIMAL(5,2) NOT NULL
            CONSTRAINT DF_AlgorithmProgress_Completion DEFAULT 0,

        TimesViewed             INT NOT NULL
            CONSTRAINT DF_AlgorithmProgress_TimesViewed DEFAULT 0,

        TimesStarted            INT NOT NULL
            CONSTRAINT DF_AlgorithmProgress_TimesStarted DEFAULT 0,

        TimesCompleted          INT NOT NULL
            CONSTRAINT DF_AlgorithmProgress_TimesCompleted DEFAULT 0,

        TimesPracticed          INT NOT NULL
            CONSTRAINT DF_AlgorithmProgress_TimesPracticed DEFAULT 0,

        TimesPredicted          INT NOT NULL
            CONSTRAINT DF_AlgorithmProgress_TimesPredicted DEFAULT 0,

        LastStepViewed          INT NULL,
        BestScore               DECIMAL(10,2) NULL,
        FirstViewedAt           DATETIME2(3) NULL,
        LastViewedAt            DATETIME2(3) NULL,
        CompletedAt             DATETIME2(3) NULL,

        UpdatedAt               DATETIME2(3) NOT NULL
            CONSTRAINT DF_AlgorithmProgress_UpdatedAt DEFAULT SYSUTCDATETIME(),

        RowVersion              ROWVERSION NOT NULL,

        CONSTRAINT FK_AlgorithmProgress_Users
            FOREIGN KEY (UserId)
            REFERENCES dbo.Users(UserId)
            ON DELETE CASCADE,

        CONSTRAINT FK_AlgorithmProgress_ContentItem
            FOREIGN KEY (ContentItemId, ContentType)
            REFERENCES dbo.ContentItems(ContentItemId, ContentType),

        CONSTRAINT FK_AlgorithmProgress_ContentVersion
            FOREIGN KEY (ContentVersionId, ContentItemId)
            REFERENCES dbo.ContentVersions(ContentVersionId, ContentItemId),

        CONSTRAINT CK_AlgorithmProgress_ContentType
            CHECK (ContentType = 'ALGORITHM'),

        CONSTRAINT CK_AlgorithmProgress_Status
            CHECK (Status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),

        CONSTRAINT CK_AlgorithmProgress_Completion
            CHECK (CompletionPercent >= 0 AND CompletionPercent <= 100),

        CONSTRAINT CK_AlgorithmProgress_Counters
            CHECK
            (
                TimesViewed >= 0 AND TimesStarted >= 0 AND TimesCompleted >= 0
                AND TimesPracticed >= 0 AND TimesPredicted >= 0
            ),

        CONSTRAINT UQ_AlgorithmProgress_UserItem
            UNIQUE (UserId, ContentItemId)
    );

    CREATE INDEX IX_AlgorithmProgress_UserLastViewed ON dbo.AlgorithmProgress(UserId, LastViewedAt DESC);
    CREATE INDEX IX_AlgorithmProgress_Status ON dbo.AlgorithmProgress(UserId, Status);
END;

-- 2. DATA STRUCTURE PROGRESS
IF OBJECT_ID('dbo.DataStructureProgress', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.DataStructureProgress
    (
        ProgressId              UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT PK_DataStructureProgress PRIMARY KEY
            DEFAULT NEWSEQUENTIALID(),

        UserId                  UNIQUEIDENTIFIER NOT NULL,
        ContentItemId           UNIQUEIDENTIFIER NOT NULL,
        ContentType             VARCHAR(30) NOT NULL
            CONSTRAINT DF_DataStructureProgress_ContentType DEFAULT 'DATA_STRUCTURE',
        ContentVersionId        UNIQUEIDENTIFIER NOT NULL,

        Status                  VARCHAR(30) NOT NULL
            CONSTRAINT DF_DataStructureProgress_Status DEFAULT 'NOT_STARTED',

        CompletionPercent       DECIMAL(5,2) NOT NULL
            CONSTRAINT DF_DataStructureProgress_Completion DEFAULT 0,

        TimesViewed             INT NOT NULL
            CONSTRAINT DF_DataStructureProgress_TimesViewed DEFAULT 0,

        TimesStarted            INT NOT NULL
            CONSTRAINT DF_DataStructureProgress_TimesStarted DEFAULT 0,

        TimesCompleted          INT NOT NULL
            CONSTRAINT DF_DataStructureProgress_TimesCompleted DEFAULT 0,

        TimesPracticed          INT NOT NULL
            CONSTRAINT DF_DataStructureProgress_TimesPracticed DEFAULT 0,

        LastOperation           VARCHAR(50) NULL,
        FirstViewedAt           DATETIME2(3) NULL,
        LastViewedAt            DATETIME2(3) NULL,
        CompletedAt             DATETIME2(3) NULL,

        UpdatedAt               DATETIME2(3) NOT NULL
            CONSTRAINT DF_DataStructureProgress_UpdatedAt DEFAULT SYSUTCDATETIME(),

        RowVersion              ROWVERSION NOT NULL,

        CONSTRAINT FK_DataStructureProgress_Users
            FOREIGN KEY (UserId)
            REFERENCES dbo.Users(UserId)
            ON DELETE CASCADE,

        CONSTRAINT FK_DataStructureProgress_ContentItem
            FOREIGN KEY (ContentItemId, ContentType)
            REFERENCES dbo.ContentItems(ContentItemId, ContentType),

        CONSTRAINT FK_DataStructureProgress_ContentVersion
            FOREIGN KEY (ContentVersionId, ContentItemId)
            REFERENCES dbo.ContentVersions(ContentVersionId, ContentItemId),

        CONSTRAINT CK_DataStructureProgress_ContentType
            CHECK (ContentType = 'DATA_STRUCTURE'),

        CONSTRAINT CK_DataStructureProgress_Status
            CHECK (Status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),

        CONSTRAINT CK_DataStructureProgress_Completion
            CHECK (CompletionPercent >= 0 AND CompletionPercent <= 100),

        CONSTRAINT CK_DataStructureProgress_Counters
            CHECK
            (
                TimesViewed >= 0 AND TimesStarted >= 0
                AND TimesCompleted >= 0 AND TimesPracticed >= 0
            ),

        CONSTRAINT UQ_DataStructureProgress_UserItem
            UNIQUE (UserId, ContentItemId)
    );

    CREATE INDEX IX_DataStructureProgress_UserLastViewed ON dbo.DataStructureProgress(UserId, LastViewedAt DESC);
    CREATE INDEX IX_DataStructureProgress_Status ON dbo.DataStructureProgress(UserId, Status);
END;

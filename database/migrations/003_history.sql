/* ============================================================
   LOGICLAB MIGRATION 003: History & Activity Tracking
   Tables: History, UserActivity, UserDailyActivity
   ============================================================ */

-- 1. HISTORY
IF OBJECT_ID('dbo.History', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.History
    (
        HistoryId               UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT PK_History PRIMARY KEY
            DEFAULT NEWSEQUENTIALID(),

        UserId                  UNIQUEIDENTIFIER NOT NULL,
        ContentItemId           UNIQUEIDENTIFIER NULL,
        ExperimentId            UNIQUEIDENTIFIER NULL,
        ComparisonId            UNIQUEIDENTIFIER NULL,
        ContentVersionId        UNIQUEIDENTIFIER NULL,

        ActionType              VARCHAR(30) NOT NULL,
        InputData               NVARCHAR(MAX) NULL,
        ResultData              NVARCHAR(MAX) NULL,
        ExecutionMetrics        NVARCHAR(MAX) NULL,

        CreatedAt               DATETIME2(3) NOT NULL
            CONSTRAINT DF_History_CreatedAt DEFAULT SYSUTCDATETIME(),

        CONSTRAINT FK_History_Users
            FOREIGN KEY (UserId)
            REFERENCES dbo.Users(UserId)
            ON DELETE CASCADE,

        CONSTRAINT FK_History_ContentItem
            FOREIGN KEY (ContentItemId)
            REFERENCES dbo.ContentItems(ContentItemId),

        CONSTRAINT FK_History_ContentVersion
            FOREIGN KEY (ContentVersionId, ContentItemId)
            REFERENCES dbo.ContentVersions(ContentVersionId, ContentItemId),

        CONSTRAINT CK_History_Target
            CHECK
            (
                (CASE WHEN ContentItemId IS NOT NULL THEN 1 ELSE 0 END)
                + (CASE WHEN ExperimentId IS NOT NULL THEN 1 ELSE 0 END)
                + (CASE WHEN ComparisonId IS NOT NULL THEN 1 ELSE 0 END)
                = 1
            ),

        CONSTRAINT CK_History_ContentVersion
            CHECK (ContentVersionId IS NULL OR ContentItemId IS NOT NULL),

        CONSTRAINT CK_History_ActionType
            CHECK
            (
                ActionType IN
                ('VIEW', 'START', 'EXECUTE', 'COMPLETE', 'PRACTICE', 'PREDICT', 'COMPARE', 'OPEN', 'SAVE')
            ),

        CONSTRAINT CK_History_InputJson
            CHECK (InputData IS NULL OR ISJSON(InputData) = 1),

        CONSTRAINT CK_History_ResultJson
            CHECK (ResultData IS NULL OR ISJSON(ResultData) = 1),

        CONSTRAINT CK_History_MetricsJson
            CHECK (ExecutionMetrics IS NULL OR ISJSON(ExecutionMetrics) = 1)
    );

    CREATE INDEX IX_History_UserCreated ON dbo.History(UserId, CreatedAt DESC);
    CREATE INDEX IX_History_Content ON dbo.History(ContentItemId, CreatedAt DESC) WHERE ContentItemId IS NOT NULL;
END;

-- 2. USER ACTIVITY
IF OBJECT_ID('dbo.UserActivity', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserActivity
    (
        ActivityId              UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT PK_UserActivity PRIMARY KEY
            DEFAULT NEWSEQUENTIALID(),

        UserId                  UNIQUEIDENTIFIER NOT NULL,

        ActivityDate            DATE NOT NULL
            CONSTRAINT DF_UserActivity_ActivityDate DEFAULT CONVERT(DATE, SYSUTCDATETIME()),

        ActivityType            VARCHAR(40) NOT NULL,

        ContentItemId           UNIQUEIDENTIFIER NULL,
        ExperimentId            UNIQUEIDENTIFIER NULL,
        ComparisonId            UNIQUEIDENTIFIER NULL,

        DurationSeconds         INT NULL,
        Metadata                NVARCHAR(MAX) NULL,

        CreatedAt               DATETIME2(3) NOT NULL
            CONSTRAINT DF_UserActivity_CreatedAt DEFAULT SYSUTCDATETIME(),

        CONSTRAINT FK_UserActivity_Users
            FOREIGN KEY (UserId)
            REFERENCES dbo.Users(UserId)
            ON DELETE CASCADE,

        CONSTRAINT FK_UserActivity_ContentItem
            FOREIGN KEY (ContentItemId)
            REFERENCES dbo.ContentItems(ContentItemId),

        CONSTRAINT CK_UserActivity_Target
            CHECK
            (
                (CASE WHEN ContentItemId IS NOT NULL THEN 1 ELSE 0 END)
                + (CASE WHEN ExperimentId IS NOT NULL THEN 1 ELSE 0 END)
                + (CASE WHEN ComparisonId IS NOT NULL THEN 1 ELSE 0 END)
                <= 1
            ),

        CONSTRAINT CK_UserActivity_Duration
            CHECK (DurationSeconds IS NULL OR DurationSeconds >= 0),

        CONSTRAINT CK_UserActivity_MetadataJson
            CHECK (Metadata IS NULL OR ISJSON(Metadata) = 1)
    );

    CREATE INDEX IX_UserActivity_UserCreated ON dbo.UserActivity(UserId, CreatedAt DESC);
    CREATE INDEX IX_UserActivity_Date ON dbo.UserActivity(ActivityDate DESC);
    CREATE INDEX IX_UserActivity_Type ON dbo.UserActivity(ActivityType, CreatedAt DESC);
END;

-- 3. USER DAILY ACTIVITY
IF OBJECT_ID('dbo.UserDailyActivity', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserDailyActivity
    (
        UserId                  UNIQUEIDENTIFIER NOT NULL,
        ActivityDate            DATE NOT NULL,

        ActivityCount           INT NOT NULL
            CONSTRAINT DF_UserDailyActivity_ActivityCount DEFAULT 0,

        LearningMinutes         INT NOT NULL
            CONSTRAINT DF_UserDailyActivity_LearningMinutes DEFAULT 0,

        ChallengesCompleted     INT NOT NULL
            CONSTRAINT DF_UserDailyActivity_Challenges DEFAULT 0,

        AlgorithmsCompleted     INT NOT NULL
            CONSTRAINT DF_UserDailyActivity_Algorithms DEFAULT 0,

        DataStructuresCompleted INT NOT NULL
            CONSTRAINT DF_UserDailyActivity_DataStructures DEFAULT 0,

        UpdatedAt               DATETIME2(3) NOT NULL
            CONSTRAINT DF_UserDailyActivity_UpdatedAt DEFAULT SYSUTCDATETIME(),

        RowVersion              ROWVERSION NOT NULL,

        CONSTRAINT PK_UserDailyActivity
            PRIMARY KEY (UserId, ActivityDate),

        CONSTRAINT FK_UserDailyActivity_Users
            FOREIGN KEY (UserId)
            REFERENCES dbo.Users(UserId)
            ON DELETE CASCADE,

        CONSTRAINT CK_UserDailyActivity_ActivityCount
            CHECK (ActivityCount >= 0),

        CONSTRAINT CK_UserDailyActivity_LearningMinutes
            CHECK (LearningMinutes >= 0),

        CONSTRAINT CK_UserDailyActivity_Challenges
            CHECK (ChallengesCompleted >= 0),

        CONSTRAINT CK_UserDailyActivity_Algorithms
            CHECK (AlgorithmsCompleted >= 0),

        CONSTRAINT CK_UserDailyActivity_DataStructures
            CHECK (DataStructuresCompleted >= 0)
    );

    CREATE INDEX IX_UserDailyActivity_Date ON dbo.UserDailyActivity(ActivityDate DESC);
END;

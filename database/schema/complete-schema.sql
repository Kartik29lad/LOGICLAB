/* ============================================================
   LOGICLAB — COMPLETE SQL SERVER SCHEMA SPECIFICATION
   Database: LogicLab_Development (SQL Server / SSMS)
   Schema: dbo
   ============================================================ */

IF DB_ID(N'LogicLab_Development') IS NULL
BEGIN
    CREATE DATABASE LogicLab_Development;
END
GO

USE LogicLab_Development;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

-- 1. USERS
IF OBJECT_ID('dbo.Users', 'U') IS NULL
CREATE TABLE dbo.Users
(
    UserId                  UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_Users PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    Username                NVARCHAR(50) NOT NULL,
    NormalizedUsername      NVARCHAR(50) NOT NULL,
    Email                   NVARCHAR(320) NOT NULL,
    NormalizedEmail         NVARCHAR(320) NOT NULL,
    PasswordHash            NVARCHAR(500) NOT NULL,
    DisplayName             NVARCHAR(100) NULL,
    AvatarUrl               NVARCHAR(1000) NULL,

    Role                    VARCHAR(30) NOT NULL
        CONSTRAINT DF_Users_Role DEFAULT 'USER',

    AccountStatus           VARCHAR(30) NOT NULL
        CONSTRAINT DF_Users_AccountStatus DEFAULT 'ACTIVE',

    EmailVerifiedAt         DATETIME2(3) NULL,
    LastLoginAt             DATETIME2(3) NULL,

    CreatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),

    UpdatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_Users_UpdatedAt DEFAULT SYSUTCDATETIME(),

    DeletedAt               DATETIME2(3) NULL,
    RowVersion              ROWVERSION NOT NULL,

    CONSTRAINT CK_Users_Role
        CHECK (Role IN ('USER', 'ADMIN')),

    CONSTRAINT CK_Users_AccountStatus
        CHECK (AccountStatus IN ('ACTIVE', 'SUSPENDED', 'LOCKED', 'DELETED')),

    CONSTRAINT CK_Users_DeletedState
        CHECK
        (
            (AccountStatus = 'DELETED' AND DeletedAt IS NOT NULL)
            OR AccountStatus <> 'DELETED'
        )
);

-- 2. USER SESSIONS
IF OBJECT_ID('dbo.UserSessions', 'U') IS NULL
CREATE TABLE dbo.UserSessions
(
    SessionId               UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_UserSessions PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    UserId                  UNIQUEIDENTIFIER NOT NULL,
    SessionTokenHash        BINARY(32) NOT NULL,
    UserAgent               NVARCHAR(1000) NULL,
    IpAddressHash           BINARY(32) NULL,

    CreatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_UserSessions_CreatedAt DEFAULT SYSUTCDATETIME(),

    LastSeenAt              DATETIME2(3) NOT NULL
        CONSTRAINT DF_UserSessions_LastSeenAt DEFAULT SYSUTCDATETIME(),

    ExpiresAt               DATETIME2(3) NOT NULL,
    LastRotatedAt           DATETIME2(3) NULL,
    RevokedAt               DATETIME2(3) NULL,
    RevocationReason        NVARCHAR(500) NULL,

    CONSTRAINT FK_UserSessions_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT UQ_UserSessions_TokenHash
        UNIQUE (SessionTokenHash)
);

-- 3. USER SETTINGS
IF OBJECT_ID('dbo.UserSettings', 'U') IS NULL
CREATE TABLE dbo.UserSettings
(
    UserId                  UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_UserSettings PRIMARY KEY,

    Theme                   VARCHAR(20) NOT NULL
        CONSTRAINT DF_UserSettings_Theme DEFAULT 'SYSTEM',

    Language                VARCHAR(20) NOT NULL
        CONSTRAINT DF_UserSettings_Language DEFAULT 'en',

    DefaultPlaybackSpeed    DECIMAL(4,2) NOT NULL
        CONSTRAINT DF_UserSettings_PlaybackSpeed DEFAULT 1.00,

    AutoPlay                BIT NOT NULL
        CONSTRAINT DF_UserSettings_AutoPlay DEFAULT 0,

    ReducedMotion           BIT NOT NULL
        CONSTRAINT DF_UserSettings_ReducedMotion DEFAULT 0,

    SoundEnabled            BIT NOT NULL
        CONSTRAINT DF_UserSettings_SoundEnabled DEFAULT 1,

    CreatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_UserSettings_CreatedAt DEFAULT SYSUTCDATETIME(),

    UpdatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_UserSettings_UpdatedAt DEFAULT SYSUTCDATETIME(),

    RowVersion              ROWVERSION NOT NULL,

    CONSTRAINT FK_UserSettings_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT CK_UserSettings_Theme
        CHECK (Theme IN ('LIGHT', 'DARK', 'SYSTEM')),

    CONSTRAINT CK_UserSettings_PlaybackSpeed
        CHECK (DefaultPlaybackSpeed >= 0.25 AND DefaultPlaybackSpeed <= 4.00)
);

-- 4. CONTENT ITEMS
IF OBJECT_ID('dbo.ContentItems', 'U') IS NULL
CREATE TABLE dbo.ContentItems
(
    ContentItemId           UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_ContentItems PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    ContentType             VARCHAR(30) NOT NULL,
    Slug                    NVARCHAR(200) NOT NULL,
    DisplayName             NVARCHAR(200) NOT NULL,

    IsActive                BIT NOT NULL
        CONSTRAINT DF_ContentItems_IsActive DEFAULT 1,

    CreatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_ContentItems_CreatedAt DEFAULT SYSUTCDATETIME(),

    UpdatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_ContentItems_UpdatedAt DEFAULT SYSUTCDATETIME(),

    RowVersion              ROWVERSION NOT NULL,

    CONSTRAINT CK_ContentItems_ContentType
        CHECK (ContentType IN ('ALGORITHM', 'DATA_STRUCTURE', 'CHALLENGE', 'LEARNING_PATH')),

    CONSTRAINT UQ_ContentItems_TypeSlug
        UNIQUE (ContentType, Slug),

    CONSTRAINT UQ_ContentItems_IdType
        UNIQUE (ContentItemId, ContentType)
);

-- 5. CONTENT VERSIONS
IF OBJECT_ID('dbo.ContentVersions', 'U') IS NULL
CREATE TABLE dbo.ContentVersions
(
    ContentVersionId        UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_ContentVersions PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    ContentItemId           UNIQUEIDENTIFIER NOT NULL,
    VersionNumber           INT NOT NULL,
    ContentHash             CHAR(64) NOT NULL,
    PublishedAt             DATETIME2(3) NULL,

    IsCurrent               BIT NOT NULL
        CONSTRAINT DF_ContentVersions_IsCurrent DEFAULT 0,

    CreatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_ContentVersions_CreatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_ContentVersions_ContentItems
        FOREIGN KEY (ContentItemId)
        REFERENCES dbo.ContentItems(ContentItemId),

    CONSTRAINT CK_ContentVersions_Version
        CHECK (VersionNumber > 0),

    CONSTRAINT UQ_ContentVersions_ItemVersion
        UNIQUE (ContentItemId, VersionNumber),

    CONSTRAINT UQ_ContentVersions_IdItem
        UNIQUE (ContentVersionId, ContentItemId)
);

-- 6. ALGORITHM PROGRESS
IF OBJECT_ID('dbo.AlgorithmProgress', 'U') IS NULL
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
        CHECK (TimesViewed >= 0 AND TimesStarted >= 0 AND TimesCompleted >= 0 AND TimesPracticed >= 0 AND TimesPredicted >= 0),

    CONSTRAINT UQ_AlgorithmProgress_UserItem
        UNIQUE (UserId, ContentItemId)
);

-- 7. DATA STRUCTURE PROGRESS
IF OBJECT_ID('dbo.DataStructureProgress', 'U') IS NULL
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
        CHECK (TimesViewed >= 0 AND TimesStarted >= 0 AND TimesCompleted >= 0 AND TimesPracticed >= 0),

    CONSTRAINT UQ_DataStructureProgress_UserItem
        UNIQUE (UserId, ContentItemId)
);

-- 8. CHALLENGE ATTEMPTS
IF OBJECT_ID('dbo.ChallengeAttempts', 'U') IS NULL
CREATE TABLE dbo.ChallengeAttempts
(
    AttemptId               UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_ChallengeAttempts PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    UserId                  UNIQUEIDENTIFIER NOT NULL,
    ContentItemId           UNIQUEIDENTIFIER NOT NULL,
    ContentType             VARCHAR(30) NOT NULL
        CONSTRAINT DF_ChallengeAttempts_ContentType DEFAULT 'CHALLENGE',
    ContentVersionId        UNIQUEIDENTIFIER NOT NULL,

    AttemptNumber           INT NOT NULL,
    AttemptStatus           VARCHAR(30) NOT NULL
        CONSTRAINT DF_ChallengeAttempts_Status DEFAULT 'STARTED',

    AnswerData              NVARCHAR(MAX) NULL,
    EvaluationData          NVARCHAR(MAX) NULL,
    FeedbackData            NVARCHAR(MAX) NULL,

    IsCorrect               BIT NULL,
    Score                   DECIMAL(10,2) NULL,
    QuestionsAnswered       INT NULL,
    CorrectAnswers          INT NULL,
    HintsUsed               INT NOT NULL
        CONSTRAINT DF_ChallengeAttempts_Hints DEFAULT 0,
    TimeSpentMs             BIGINT NULL,

    StartedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_ChallengeAttempts_StartedAt DEFAULT SYSUTCDATETIME(),
    SubmittedAt             DATETIME2(3) NULL,
    CreatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_ChallengeAttempts_CreatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_ChallengeAttempts_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT FK_ChallengeAttempts_ContentItem
        FOREIGN KEY (ContentItemId, ContentType)
        REFERENCES dbo.ContentItems(ContentItemId, ContentType),

    CONSTRAINT FK_ChallengeAttempts_ContentVersion
        FOREIGN KEY (ContentVersionId, ContentItemId)
        REFERENCES dbo.ContentVersions(ContentVersionId, ContentItemId),

    CONSTRAINT CK_ChallengeAttempts_ContentType
        CHECK (ContentType = 'CHALLENGE'),

    CONSTRAINT CK_ChallengeAttempts_Status
        CHECK (AttemptStatus IN ('STARTED', 'SUBMITTED', 'EVALUATED', 'ABANDONED')),

    CONSTRAINT CK_ChallengeAttempts_AttemptNumber
        CHECK (AttemptNumber > 0),

    CONSTRAINT CK_ChallengeAttempts_Hints
        CHECK (HintsUsed >= 0),

    CONSTRAINT CK_ChallengeAttempts_Time
        CHECK (TimeSpentMs IS NULL OR TimeSpentMs >= 0),

    CONSTRAINT CK_ChallengeAttempts_AnswerJson
        CHECK (AnswerData IS NULL OR ISJSON(AnswerData) = 1),

    CONSTRAINT CK_ChallengeAttempts_EvaluationJson
        CHECK (EvaluationData IS NULL OR ISJSON(EvaluationData) = 1),

    CONSTRAINT CK_ChallengeAttempts_FeedbackJson
        CHECK (FeedbackData IS NULL OR ISJSON(FeedbackData) = 1),

    CONSTRAINT UQ_ChallengeAttempts_UserChallengeAttempt
        UNIQUE (UserId, ContentItemId, AttemptNumber),

    CONSTRAINT UQ_ChallengeAttempts_AttemptUserContent
        UNIQUE (AttemptId, UserId, ContentItemId)
);

-- 9. CHALLENGE PROGRESS
IF OBJECT_ID('dbo.ChallengeProgress', 'U') IS NULL
CREATE TABLE dbo.ChallengeProgress
(
    ChallengeProgressId     UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_ChallengeProgress PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    UserId                  UNIQUEIDENTIFIER NOT NULL,
    ContentItemId           UNIQUEIDENTIFIER NOT NULL,
    ContentType             VARCHAR(30) NOT NULL
        CONSTRAINT DF_ChallengeProgress_ContentType DEFAULT 'CHALLENGE',
    ContentVersionId        UNIQUEIDENTIFIER NOT NULL,

    Status                  VARCHAR(30) NOT NULL
        CONSTRAINT DF_ChallengeProgress_Status DEFAULT 'NOT_STARTED',

    BestAttemptId           UNIQUEIDENTIFIER NULL,
    AttemptsCount           INT NOT NULL
        CONSTRAINT DF_ChallengeProgress_Attempts DEFAULT 0,
    HintsUsed               INT NOT NULL
        CONSTRAINT DF_ChallengeProgress_Hints DEFAULT 0,

    FirstAttemptedAt        DATETIME2(3) NULL,
    LastAttemptedAt         DATETIME2(3) NULL,
    CompletedAt             DATETIME2(3) NULL,

    UpdatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_ChallengeProgress_UpdatedAt DEFAULT SYSUTCDATETIME(),

    RowVersion              ROWVERSION NOT NULL,

    CONSTRAINT FK_ChallengeProgress_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT FK_ChallengeProgress_ContentItem
        FOREIGN KEY (ContentItemId, ContentType)
        REFERENCES dbo.ContentItems(ContentItemId, ContentType),

    CONSTRAINT FK_ChallengeProgress_ContentVersion
        FOREIGN KEY (ContentVersionId, ContentItemId)
        REFERENCES dbo.ContentVersions(ContentVersionId, ContentItemId),

    CONSTRAINT FK_ChallengeProgress_BestAttempt
        FOREIGN KEY (BestAttemptId, UserId, ContentItemId)
        REFERENCES dbo.ChallengeAttempts (AttemptId, UserId, ContentItemId),

    CONSTRAINT CK_ChallengeProgress_ContentType
        CHECK (ContentType = 'CHALLENGE'),

    CONSTRAINT CK_ChallengeProgress_Status
        CHECK (Status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),

    CONSTRAINT CK_ChallengeProgress_Attempts
        CHECK (AttemptsCount >= 0),

    CONSTRAINT CK_ChallengeProgress_Hints
        CHECK (HintsUsed >= 0),

    CONSTRAINT UQ_ChallengeProgress_UserChallenge
        UNIQUE (UserId, ContentItemId)
);

-- 10. LEARNING PATH PROGRESS
IF OBJECT_ID('dbo.LearningPathProgress', 'U') IS NULL
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
            OR
            (CurrentItemContentItemId IS NOT NULL AND CurrentItemContentType IS NOT NULL)
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

-- 11. LEARNING PATH ITEM PROGRESS
IF OBJECT_ID('dbo.LearningPathItemProgress', 'U') IS NULL
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

-- 12. FAVORITES
IF OBJECT_ID('dbo.Favorites', 'U') IS NULL
CREATE TABLE dbo.Favorites
(
    FavoriteId              UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_Favorites PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    UserId                  UNIQUEIDENTIFIER NOT NULL,
    ContentItemId           UNIQUEIDENTIFIER NOT NULL,

    CreatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_Favorites_CreatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Favorites_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT FK_Favorites_ContentItems
        FOREIGN KEY (ContentItemId)
        REFERENCES dbo.ContentItems(ContentItemId),

    CONSTRAINT UQ_Favorites_UserContent
        UNIQUE (UserId, ContentItemId)
);

-- 13. EXPERIMENTS
IF OBJECT_ID('dbo.Experiments', 'U') IS NULL
CREATE TABLE dbo.Experiments
(
    ExperimentId             UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_Experiments PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    UserId                   UNIQUEIDENTIFIER NOT NULL,
    Name                     NVARCHAR(200) NOT NULL,
    Description              NVARCHAR(2000) NULL,
    ExperimentType           VARCHAR(40) NOT NULL,

    InputData                NVARCHAR(MAX) NOT NULL,
    ConfigurationData        NVARCHAR(MAX) NULL,
    RandomSeed               BIGINT NULL,
    ExecutionSettings        NVARCHAR(MAX) NULL,

    Status                   VARCHAR(30) NOT NULL
        CONSTRAINT DF_Experiments_Status DEFAULT 'DRAFT',

    CreatedAt                DATETIME2(3) NOT NULL
        CONSTRAINT DF_Experiments_CreatedAt DEFAULT SYSUTCDATETIME(),

    UpdatedAt                DATETIME2(3) NOT NULL
        CONSTRAINT DF_Experiments_UpdatedAt DEFAULT SYSUTCDATETIME(),

    LastOpenedAt             DATETIME2(3) NULL,
    RowVersion               ROWVERSION NOT NULL,

    CONSTRAINT FK_Experiments_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT CK_Experiments_Type
        CHECK (ExperimentType IN ('ALGORITHM', 'DATA_STRUCTURE', 'GRAPH', 'TREE', 'COMPARISON', 'CUSTOM')),

    CONSTRAINT CK_Experiments_Status
        CHECK (Status IN ('DRAFT', 'SAVED', 'ARCHIVED')),

    CONSTRAINT CK_Experiments_InputJson
        CHECK (ISJSON(InputData) = 1),

    CONSTRAINT CK_Experiments_ConfigurationJson
        CHECK (ConfigurationData IS NULL OR ISJSON(ConfigurationData) = 1),

    CONSTRAINT CK_Experiments_ExecutionSettingsJson
        CHECK (ExecutionSettings IS NULL OR ISJSON(ExecutionSettings) = 1)
);

-- 14. EXPERIMENT ALGORITHMS
IF OBJECT_ID('dbo.ExperimentAlgorithms', 'U') IS NULL
CREATE TABLE dbo.ExperimentAlgorithms
(
    ExperimentAlgorithmId    UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_ExperimentAlgorithms PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    ExperimentId             UNIQUEIDENTIFIER NOT NULL,
    ContentItemId            UNIQUEIDENTIFIER NOT NULL,
    ContentVersionId         UNIQUEIDENTIFIER NOT NULL,

    ExecutionOrder           INT NOT NULL,

    CreatedAt                DATETIME2(3) NOT NULL
        CONSTRAINT DF_ExperimentAlgorithms_CreatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_ExperimentAlgorithms_Experiments
        FOREIGN KEY (ExperimentId)
        REFERENCES dbo.Experiments(ExperimentId)
        ON DELETE CASCADE,

    CONSTRAINT FK_ExperimentAlgorithms_ContentItem
        FOREIGN KEY (ContentItemId)
        REFERENCES dbo.ContentItems(ContentItemId),

    CONSTRAINT FK_ExperimentAlgorithms_ContentVersion
        FOREIGN KEY (ContentVersionId, ContentItemId)
        REFERENCES dbo.ContentVersions(ContentVersionId, ContentItemId),

    CONSTRAINT CK_ExperimentAlgorithms_Order
        CHECK (ExecutionOrder > 0),

    CONSTRAINT UQ_ExperimentAlgorithms_Algorithm
        UNIQUE (ExperimentId, ContentItemId)
);

-- 15. EXPERIMENT EXECUTIONS
IF OBJECT_ID('dbo.ExperimentExecutions', 'U') IS NULL
CREATE TABLE dbo.ExperimentExecutions
(
    ExecutionId              UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_ExperimentExecutions PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    ExperimentAlgorithmId    UNIQUEIDENTIFIER NOT NULL,
    ExecutionNumber          INT NOT NULL,

    InputSnapshot            NVARCHAR(MAX) NOT NULL,
    ConfigurationSnapshot    NVARCHAR(MAX) NULL,
    RandomSeed               BIGINT NULL,
    ResultData               NVARCHAR(MAX) NULL,
    MetricsData              NVARCHAR(MAX) NULL,

    ExecutionStatus          VARCHAR(30) NOT NULL
        CONSTRAINT DF_ExperimentExecutions_Status DEFAULT 'QUEUED',

    ExecutionDurationMs      BIGINT NULL,
    StartedAt                DATETIME2(3) NULL,
    ExecutedAt               DATETIME2(3) NULL,

    CreatedAt                DATETIME2(3) NOT NULL
        CONSTRAINT DF_ExperimentExecutions_CreatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_ExperimentExecutions_ExperimentAlgorithm
        FOREIGN KEY (ExperimentAlgorithmId)
        REFERENCES dbo.ExperimentAlgorithms(ExperimentAlgorithmId)
        ON DELETE CASCADE,

    CONSTRAINT CK_ExperimentExecutions_Number
        CHECK (ExecutionNumber > 0),

    CONSTRAINT CK_ExperimentExecutions_InputJson
        CHECK (ISJSON(InputSnapshot) = 1),

    CONSTRAINT CK_ExperimentExecutions_ConfigJson
        CHECK (ConfigurationSnapshot IS NULL OR ISJSON(ConfigurationSnapshot) = 1),

    CONSTRAINT CK_ExperimentExecutions_ResultJson
        CHECK (ResultData IS NULL OR ISJSON(ResultData) = 1),

    CONSTRAINT CK_ExperimentExecutions_MetricsJson
        CHECK (MetricsData IS NULL OR ISJSON(MetricsData) = 1),

    CONSTRAINT CK_ExperimentExecutions_Status
        CHECK (ExecutionStatus IN ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),

    CONSTRAINT CK_ExperimentExecutions_Duration
        CHECK (ExecutionDurationMs IS NULL OR ExecutionDurationMs >= 0),

    CONSTRAINT UQ_ExperimentExecutions_Run
        UNIQUE (ExperimentAlgorithmId, ExecutionNumber)
);

-- 16. BOOKMARKS
IF OBJECT_ID('dbo.Bookmarks', 'U') IS NULL
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
            OR
            (ContentItemId IS NULL AND ExperimentId IS NOT NULL)
        ),

    CONSTRAINT CK_Bookmarks_StepNumber
        CHECK (StepNumber IS NULL OR StepNumber >= 0)
);

-- 17. COMPARISONS
IF OBJECT_ID('dbo.Comparisons', 'U') IS NULL
CREATE TABLE dbo.Comparisons
(
    ComparisonId             UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_Comparisons PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    UserId                   UNIQUEIDENTIFIER NOT NULL,
    Name                     NVARCHAR(200) NULL,
    InputData                NVARCHAR(MAX) NOT NULL,
    ConfigurationData        NVARCHAR(MAX) NULL,

    CreatedAt                DATETIME2(3) NOT NULL
        CONSTRAINT DF_Comparisons_CreatedAt DEFAULT SYSUTCDATETIME(),

    UpdatedAt                DATETIME2(3) NOT NULL
        CONSTRAINT DF_Comparisons_UpdatedAt DEFAULT SYSUTCDATETIME(),

    RowVersion               ROWVERSION NOT NULL,

    CONSTRAINT FK_Comparisons_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT CK_Comparisons_InputJson
        CHECK (ISJSON(InputData) = 1),

    CONSTRAINT CK_Comparisons_ConfigJson
        CHECK (ConfigurationData IS NULL OR ISJSON(ConfigurationData) = 1)
);

-- 18. COMPARISON ALGORITHMS
IF OBJECT_ID('dbo.ComparisonAlgorithms', 'U') IS NULL
CREATE TABLE dbo.ComparisonAlgorithms
(
    ComparisonAlgorithmId    UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_ComparisonAlgorithms PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    ComparisonId             UNIQUEIDENTIFIER NOT NULL,
    ContentItemId            UNIQUEIDENTIFIER NOT NULL,
    ContentVersionId         UNIQUEIDENTIFIER NOT NULL,
    ExecutionOrder           INT NOT NULL,

    MetricsData              NVARCHAR(MAX) NULL,
    ResultData               NVARCHAR(MAX) NULL,
    ExecutionDurationMs      BIGINT NULL,

    CreatedAt                DATETIME2(3) NOT NULL
        CONSTRAINT DF_ComparisonAlgorithms_CreatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_ComparisonAlgorithms_Comparisons
        FOREIGN KEY (ComparisonId)
        REFERENCES dbo.Comparisons(ComparisonId)
        ON DELETE CASCADE,

    CONSTRAINT FK_ComparisonAlgorithms_ContentItem
        FOREIGN KEY (ContentItemId)
        REFERENCES dbo.ContentItems(ContentItemId),

    CONSTRAINT FK_ComparisonAlgorithms_ContentVersion
        FOREIGN KEY (ContentVersionId, ContentItemId)
        REFERENCES dbo.ContentVersions(ContentVersionId, ContentItemId),

    CONSTRAINT CK_ComparisonAlgorithms_Order
        CHECK (ExecutionOrder > 0),

    CONSTRAINT CK_ComparisonAlgorithms_MetricsJson
        CHECK (MetricsData IS NULL OR ISJSON(MetricsData) = 1),

    CONSTRAINT CK_ComparisonAlgorithms_ResultJson
        CHECK (ResultData IS NULL OR ISJSON(ResultData) = 1),

    CONSTRAINT CK_ComparisonAlgorithms_Duration
        CHECK (ExecutionDurationMs IS NULL OR ExecutionDurationMs >= 0),

    CONSTRAINT UQ_ComparisonAlgorithms_Algorithm
        UNIQUE (ComparisonId, ContentItemId)
);

-- 19. HISTORY
IF OBJECT_ID('dbo.History', 'U') IS NULL
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

    CONSTRAINT FK_History_Experiment
        FOREIGN KEY (ExperimentId)
        REFERENCES dbo.Experiments(ExperimentId),

    CONSTRAINT FK_History_Comparison
        FOREIGN KEY (ComparisonId)
        REFERENCES dbo.Comparisons(ComparisonId),

    CONSTRAINT FK_History_ContentVersion
        FOREIGN KEY (ContentVersionId, ContentItemId)
        REFERENCES dbo.ContentVersions(ContentVersionId, ContentItemId),

    CONSTRAINT CK_History_Target
        CHECK
        (
            (CASE WHEN ContentItemId IS NOT NULL THEN 1 ELSE 0 END)
            + (CASE WHEN ExperimentId IS NOT NULL THEN 1 ELSE 0 END)
            + (CASE WHEN ComparisonId IS NOT NULL THEN 1 ELSE 0 END) = 1
        ),

    CONSTRAINT CK_History_ContentVersion
        CHECK (ContentVersionId IS NULL OR ContentItemId IS NOT NULL),

    CONSTRAINT CK_History_ActionType
        CHECK (ActionType IN ('VIEW', 'START', 'EXECUTE', 'COMPLETE', 'PRACTICE', 'PREDICT', 'COMPARE', 'OPEN', 'SAVE')),

    CONSTRAINT CK_History_InputJson
        CHECK (InputData IS NULL OR ISJSON(InputData) = 1),

    CONSTRAINT CK_History_ResultJson
        CHECK (ResultData IS NULL OR ISJSON(ResultData) = 1),

    CONSTRAINT CK_History_MetricsJson
        CHECK (ExecutionMetrics IS NULL OR ISJSON(ExecutionMetrics) = 1)
);

-- 20. USER ACTIVITY
IF OBJECT_ID('dbo.UserActivity', 'U') IS NULL
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

    CONSTRAINT FK_UserActivity_Experiment
        FOREIGN KEY (ExperimentId)
        REFERENCES dbo.Experiments(ExperimentId),

    CONSTRAINT FK_UserActivity_Comparison
        FOREIGN KEY (ComparisonId)
        REFERENCES dbo.Comparisons(ComparisonId),

    CONSTRAINT CK_UserActivity_Target
        CHECK
        (
            (CASE WHEN ContentItemId IS NOT NULL THEN 1 ELSE 0 END)
            + (CASE WHEN ExperimentId IS NOT NULL THEN 1 ELSE 0 END)
            + (CASE WHEN ComparisonId IS NOT NULL THEN 1 ELSE 0 END) <= 1
        ),

    CONSTRAINT CK_UserActivity_Duration
        CHECK (DurationSeconds IS NULL OR DurationSeconds >= 0),

    CONSTRAINT CK_UserActivity_MetadataJson
        CHECK (Metadata IS NULL OR ISJSON(Metadata) = 1)
);

-- 21. USER DAILY ACTIVITY
IF OBJECT_ID('dbo.UserDailyActivity', 'U') IS NULL
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

    CONSTRAINT PK_UserDailyActivity PRIMARY KEY (UserId, ActivityDate),

    CONSTRAINT FK_UserDailyActivity_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT CK_UserDailyActivity_ActivityCount CHECK (ActivityCount >= 0),
    CONSTRAINT CK_UserDailyActivity_LearningMinutes CHECK (LearningMinutes >= 0),
    CONSTRAINT CK_UserDailyActivity_Challenges CHECK (ChallengesCompleted >= 0),
    CONSTRAINT CK_UserDailyActivity_Algorithms CHECK (AlgorithmsCompleted >= 0),
    CONSTRAINT CK_UserDailyActivity_DataStructures CHECK (DataStructuresCompleted >= 0)
);

-- 22. ACHIEVEMENTS
IF OBJECT_ID('dbo.Achievements', 'U') IS NULL
CREATE TABLE dbo.Achievements
(
    AchievementId          UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_Achievements PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    AchievementCode        VARCHAR(100) NOT NULL,
    Name                   NVARCHAR(150) NOT NULL,
    Description            NVARCHAR(1000) NOT NULL,
    Category               VARCHAR(50) NOT NULL,
    Criteria               NVARCHAR(MAX) NOT NULL,
    Icon                   NVARCHAR(500) NULL,

    IsActive               BIT NOT NULL
        CONSTRAINT DF_Achievements_IsActive DEFAULT 1,

    CreatedAt              DATETIME2(3) NOT NULL
        CONSTRAINT DF_Achievements_CreatedAt DEFAULT SYSUTCDATETIME(),

    UpdatedAt              DATETIME2(3) NOT NULL
        CONSTRAINT DF_Achievements_UpdatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT UQ_Achievements_Code UNIQUE (AchievementCode),
    CONSTRAINT CK_Achievements_CriteriaJson CHECK (ISJSON(Criteria) = 1)
);

-- 23. USER ACHIEVEMENTS
IF OBJECT_ID('dbo.UserAchievements', 'U') IS NULL
CREATE TABLE dbo.UserAchievements
(
    UserAchievementId       UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_UserAchievements PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    UserId                  UNIQUEIDENTIFIER NOT NULL,
    AchievementId           UNIQUEIDENTIFIER NOT NULL,
    ProgressData            NVARCHAR(MAX) NULL,

    EarnedAt                DATETIME2(3) NOT NULL
        CONSTRAINT DF_UserAchievements_EarnedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_UserAchievements_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT FK_UserAchievements_Achievements
        FOREIGN KEY (AchievementId)
        REFERENCES dbo.Achievements(AchievementId),

    CONSTRAINT CK_UserAchievements_ProgressJson CHECK (ProgressData IS NULL OR ISJSON(ProgressData) = 1),
    CONSTRAINT UQ_UserAchievements_UserAchievement UNIQUE (UserId, AchievementId)
);

COMMIT TRANSACTION;

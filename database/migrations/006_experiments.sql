/* ============================================================
   LOGICLAB MIGRATION 006: Experiments & Comparisons
   Tables: Experiments, ExperimentAlgorithms, ExperimentExecutions,
           Comparisons, ComparisonAlgorithms
   ============================================================ */

-- 1. EXPERIMENTS
IF OBJECT_ID('dbo.Experiments', 'U') IS NULL
BEGIN
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

    CREATE INDEX IX_Experiments_UserUpdated ON dbo.Experiments(UserId, UpdatedAt DESC);
    CREATE INDEX IX_Experiments_UserStatus ON dbo.Experiments(UserId, Status);
END;

-- 2. EXPERIMENT ALGORITHMS
IF OBJECT_ID('dbo.ExperimentAlgorithms', 'U') IS NULL
BEGIN
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

    CREATE INDEX IX_ExperimentAlgorithms_ExperimentOrder ON dbo.ExperimentAlgorithms(ExperimentId, ExecutionOrder);
END;

-- 3. EXPERIMENT EXECUTIONS
IF OBJECT_ID('dbo.ExperimentExecutions', 'U') IS NULL
BEGIN
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

    CREATE INDEX IX_ExperimentExecutions_AlgorithmExecuted ON dbo.ExperimentExecutions(ExperimentAlgorithmId, ExecutedAt DESC);
    CREATE INDEX IX_ExperimentExecutions_Status ON dbo.ExperimentExecutions(ExecutionStatus);
END;

-- 4. COMPARISONS
IF OBJECT_ID('dbo.Comparisons', 'U') IS NULL
BEGIN
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

    CREATE INDEX IX_Comparisons_UserUpdated ON dbo.Comparisons(UserId, UpdatedAt DESC);
END;

-- 5. COMPARISON ALGORITHMS
IF OBJECT_ID('dbo.ComparisonAlgorithms', 'U') IS NULL
BEGIN
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

    CREATE INDEX IX_ComparisonAlgorithms_ComparisonOrder ON dbo.ComparisonAlgorithms(ComparisonId, ExecutionOrder);
END;

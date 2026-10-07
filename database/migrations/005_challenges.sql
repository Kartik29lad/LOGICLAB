/* ============================================================
   LOGICLAB MIGRATION 005: Challenges & Attempts
   Tables: ChallengeAttempts, ChallengeProgress
   ============================================================ */

-- 1. CHALLENGE ATTEMPTS
IF OBJECT_ID('dbo.ChallengeAttempts', 'U') IS NULL
BEGIN
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

    CREATE INDEX IX_ChallengeAttempts_UserChallenge ON dbo.ChallengeAttempts(UserId, ContentItemId, CreatedAt DESC);
    CREATE INDEX IX_ChallengeAttempts_ContentVersion ON dbo.ChallengeAttempts(ContentVersionId);
    CREATE INDEX IX_ChallengeAttempts_Status ON dbo.ChallengeAttempts(AttemptStatus);
END;

-- 2. CHALLENGE PROGRESS
IF OBJECT_ID('dbo.ChallengeProgress', 'U') IS NULL
BEGIN
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
            REFERENCES dbo.ChallengeAttempts(AttemptId, UserId, ContentItemId),

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

    CREATE INDEX IX_ChallengeProgress_UserLastAttempt ON dbo.ChallengeProgress(UserId, LastAttemptedAt DESC);
    CREATE INDEX IX_ChallengeProgress_Status ON dbo.ChallengeProgress(UserId, Status);
END;

/* ============================================================
   LOGICLAB MIGRATION 008: Achievements
   Tables: Achievements, UserAchievements
   ============================================================ */

-- 1. ACHIEVEMENTS
IF OBJECT_ID('dbo.Achievements', 'U') IS NULL
BEGIN
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

        CONSTRAINT UQ_Achievements_Code
            UNIQUE (AchievementCode),

        CONSTRAINT CK_Achievements_CriteriaJson
            CHECK (ISJSON(Criteria) = 1)
    );

    CREATE INDEX IX_Achievements_Category ON dbo.Achievements(Category);
    CREATE INDEX IX_Achievements_Active ON dbo.Achievements(IsActive);
END;

-- 2. USER ACHIEVEMENTS
IF OBJECT_ID('dbo.UserAchievements', 'U') IS NULL
BEGIN
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

        CONSTRAINT CK_UserAchievements_ProgressJson
            CHECK (ProgressData IS NULL OR ISJSON(ProgressData) = 1),

        CONSTRAINT UQ_UserAchievements_UserAchievement
            UNIQUE (UserId, AchievementId)
    );

    CREATE INDEX IX_UserAchievements_User ON dbo.UserAchievements(UserId);
    CREATE INDEX IX_UserAchievements_EarnedAt ON dbo.UserAchievements(UserId, EarnedAt DESC);
END;

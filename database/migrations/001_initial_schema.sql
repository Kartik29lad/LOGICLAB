/* ============================================================
   LOGICLAB MIGRATION 001: Initial Schema
   Tables: Users, UserSessions, ContentItems, ContentVersions
   ============================================================ */

-- 1. USERS
IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
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

    CREATE UNIQUE INDEX UX_Users_NormalizedUsername
    ON dbo.Users(NormalizedUsername)
    WHERE DeletedAt IS NULL;

    CREATE UNIQUE INDEX UX_Users_NormalizedEmail
    ON dbo.Users(NormalizedEmail)
    WHERE DeletedAt IS NULL;
END;

-- 2. USER SESSIONS
IF OBJECT_ID('dbo.UserSessions', 'U') IS NULL
BEGIN
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

    CREATE INDEX IX_UserSessions_UserId ON dbo.UserSessions(UserId);
    CREATE INDEX IX_UserSessions_ExpiresAt ON dbo.UserSessions(ExpiresAt);
END;

-- 3. CONTENT ITEMS
IF OBJECT_ID('dbo.ContentItems', 'U') IS NULL
BEGIN
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

    CREATE INDEX IX_ContentItems_Type ON dbo.ContentItems(ContentType);
    CREATE INDEX IX_ContentItems_IsActive ON dbo.ContentItems(ContentType, IsActive);
END;

-- 4. CONTENT VERSIONS
IF OBJECT_ID('dbo.ContentVersions', 'U') IS NULL
BEGIN
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

    CREATE INDEX IX_ContentVersions_Item ON dbo.ContentVersions(ContentItemId, VersionNumber DESC);

    CREATE UNIQUE INDEX UX_ContentVersions_Current
    ON dbo.ContentVersions(ContentItemId)
    WHERE IsCurrent = 1;
END;

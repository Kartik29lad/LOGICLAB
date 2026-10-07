/* ============================================================
   LOGICLAB MIGRATION 010: User Settings
   Table: UserSettings
   ============================================================ */

IF OBJECT_ID('dbo.UserSettings', 'U') IS NULL
BEGIN
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
END;

/* ============================================================
   LOGICLAB MIGRATION 004: Favorites
   Table: Favorites
   ============================================================ */

IF OBJECT_ID('dbo.Favorites', 'U') IS NULL
BEGIN
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

    CREATE INDEX IX_Favorites_User ON dbo.Favorites(UserId);
    CREATE INDEX IX_Favorites_ContentItem ON dbo.Favorites(ContentItemId);
END;

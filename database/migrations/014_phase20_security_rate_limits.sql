/* Phase 20: distributed API rate-limit buckets. */
IF OBJECT_ID(N'dbo.ApiRateLimitBuckets', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ApiRateLimitBuckets
    (
        KeyHash       BINARY(32) NOT NULL CONSTRAINT PK_ApiRateLimitBuckets PRIMARY KEY,
        WindowStart   DATETIME2(3) NOT NULL,
        RequestCount  INT NOT NULL CONSTRAINT CK_ApiRateLimitBuckets_Count CHECK (RequestCount > 0),
        ExpiresAt     DATETIME2(3) NOT NULL,
        UpdatedAt     DATETIME2(3) NOT NULL CONSTRAINT DF_ApiRateLimitBuckets_UpdatedAt DEFAULT SYSUTCDATETIME()
    );

    CREATE INDEX IX_ApiRateLimitBuckets_ExpiresAt ON dbo.ApiRateLimitBuckets(ExpiresAt);
END;

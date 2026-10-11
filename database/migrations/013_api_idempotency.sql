/* Phase 19: durable idempotency records for retry-safe mutations. */
IF OBJECT_ID('dbo.ApiIdempotencyKeys', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ApiIdempotencyKeys
  (
    ApiIdempotencyKeyId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ApiIdempotencyKeys PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    Route NVARCHAR(200) NOT NULL,
    IdempotencyKey NVARCHAR(128) NOT NULL,
    RequestHash CHAR(64) NOT NULL,
    StatusCode INT NOT NULL CONSTRAINT DF_ApiIdempotency_StatusCode DEFAULT 0,
    ResponseJson NVARCHAR(MAX) NOT NULL CONSTRAINT DF_ApiIdempotency_Response DEFAULT N'',
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ApiIdempotency_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ApiIdempotency_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ApiIdempotency_User FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId) ON DELETE CASCADE,
    CONSTRAINT CK_ApiIdempotency_Hash CHECK (LEN(RequestHash)=64),
    CONSTRAINT UQ_ApiIdempotency_UserRouteKey UNIQUE(UserId,Route,IdempotencyKey)
  );
  CREATE INDEX IX_ApiIdempotency_CreatedAt ON dbo.ApiIdempotencyKeys(CreatedAt);
END;
GO

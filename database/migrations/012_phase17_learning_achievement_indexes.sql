/* ============================================================
   LOGICLAB MIGRATION 012: Phase 17 indexes and execution support
   ============================================================ */

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_LearningPathProgress_UserPathStatus' AND object_id=OBJECT_ID('dbo.LearningPathProgress'))
    CREATE INDEX IX_LearningPathProgress_UserPathStatus ON dbo.LearningPathProgress(UserId, ContentItemId, Status);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_LearningPathItemProgress_ItemStatus' AND object_id=OBJECT_ID('dbo.LearningPathItemProgress'))
    CREATE INDEX IX_LearningPathItemProgress_ItemStatus ON dbo.LearningPathItemProgress(ItemContentItemId, Status);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_UserActivity_UserTypeDate' AND object_id=OBJECT_ID('dbo.UserActivity'))
    CREATE INDEX IX_UserActivity_UserTypeDate ON dbo.UserActivity(UserId, ActivityType, ActivityDate);

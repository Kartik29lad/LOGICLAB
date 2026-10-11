/* ============================================================
   LOGICLAB DEVELOPMENT SEEDS: Phase 17 achievement catalog
   ============================================================ */

MERGE dbo.Achievements AS target
USING (VALUES
 ('FIRST_EXECUTION',N'First Run',N'Execute your first algorithm or data structure.','STARTER',N'{"type":"FIRST_EXECUTION"}',1),
 ('FIVE_CONCEPTS',N'Five Concepts',N'Complete five algorithms or data structures.','PROGRESS',N'{"type":"COMPLETED_CONCEPTS","threshold":5}',1),
 ('TEN_CONCEPTS',N'Ten Concepts',N'Complete ten algorithms or data structures.','PROGRESS',N'{"type":"COMPLETED_CONCEPTS","threshold":10}',1),
 ('FIRST_CHALLENGE',N'Challenge Accepted',N'Complete your first challenge.','PRACTICE',N'{"type":"CHALLENGE_MILESTONE","threshold":1}',1),
 ('FIVE_CHALLENGES',N'Practice Builder',N'Complete five challenges.','PRACTICE',N'{"type":"CHALLENGE_MILESTONE","threshold":5}',1),
 ('THREE_DAY_STREAK',N'Three-Day Streak',N'Learn on three consecutive days.','CONSISTENCY',N'{"type":"STREAK","threshold":3}',1),
 ('BREADTH_TWO_CATEGORIES',N'Explore Broadly',N'Complete concepts across at least two categories.','BREADTH',N'{"type":"BREADTH","threshold":2}',1),
 ('DEPTH_PATH',N'Path Finisher',N'Complete an entire learning path.','DEPTH',N'{"type":"DEPTH","threshold":1}',1)
) AS source(AchievementCode,Name,Description,Category,Criteria,IsActive)
ON target.AchievementCode=source.AchievementCode
WHEN MATCHED THEN UPDATE SET Name=source.Name,Description=source.Description,Category=source.Category,Criteria=source.Criteria,IsActive=source.IsActive,UpdatedAt=SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT(AchievementCode,Name,Description,Category,Criteria,IsActive) VALUES(source.AchievementCode,source.Name,source.Description,source.Category,source.Criteria,source.IsActive);

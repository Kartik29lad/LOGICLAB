/* ============================================================
   LOGICLAB DEMO SEEDS: Demo Exploratory Data
   Provides ready-to-explore content, experiments, and history
   ============================================================ */

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

-- Ensure demo user exists
DECLARE @DemoUserId UNIQUEIDENTIFIER = 'CCCCCCCC-0000-0000-0000-000000000003';

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE UserId = @DemoUserId)
BEGIN
    INSERT INTO dbo.Users
    (
        UserId,
        Username,
        NormalizedUsername,
        Email,
        NormalizedEmail,
        PasswordHash,
        DisplayName,
        Role,
        AccountStatus
    )
    VALUES
    (
        @DemoUserId,
        'demouser',
        'DEMOUSER',
        'demo@logiclab.local',
        'DEMO@LOGICLAB.LOCAL',
        '$argon2id$v=19$m=65536,t=3,p=4$ZGVtb19zYWx0$ZGVtb19oYXNo',
        'LogicLab Explorer',
        'USER',
        'ACTIVE'
    );

    INSERT INTO dbo.UserSettings (UserId, Theme, Language, DefaultPlaybackSpeed)
    VALUES (@DemoUserId, 'DARK', 'en', 1.25);
END;

-- Demo Experiment
IF NOT EXISTS (SELECT 1 FROM dbo.Experiments WHERE UserId = @DemoUserId AND Name = 'Sorting Showcase')
BEGIN
    INSERT INTO dbo.Experiments
    (
        ExperimentId,
        UserId,
        Name,
        Description,
        ExperimentType,
        InputData,
        ConfigurationData,
        Status
    )
    VALUES
    (
        NEWID(),
        @DemoUserId,
        'Sorting Showcase',
        'Comparing Quick Sort vs Merge Sort performance across diverse arrays.',
        'COMPARISON',
        N'{"arraySize": 50, "distribution": "nearly_sorted"}',
        N'{"stepDelayMs": 20}',
        'SAVED'
    );
END;

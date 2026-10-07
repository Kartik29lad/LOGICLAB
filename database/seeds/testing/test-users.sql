/* ============================================================
   LOGICLAB TEST FIXTURES: Test Users & Settings
   Predictable GUIDs for automated testing suites
   ============================================================ */

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

-- Test Admin User: AAAAAAAA-0000-0000-0000-000000000001
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE NormalizedUsername = 'TESTADMIN')
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
        'AAAAAAAA-0000-0000-0000-000000000001',
        'testadmin',
        'TESTADMIN',
        'admin@test.logiclab.local',
        'ADMIN@TEST.LOGICLAB.LOCAL',
        '$argon2id$v=19$m=65536,t=3,p=4$dGVzdF9zYWx0$dGVzdF9oYXNo',
        'Test Admin',
        'ADMIN',
        'ACTIVE'
    );

    INSERT INTO dbo.UserSettings (UserId, Theme, Language)
    VALUES ('AAAAAAAA-0000-0000-0000-000000000001', 'DARK', 'en');
END;

-- Test Student User: BBBBBBBB-0000-0000-0000-000000000002
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE NormalizedUsername = 'TESTSTUDENT')
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
        'BBBBBBBB-0000-0000-0000-000000000002',
        'teststudent',
        'TESTSTUDENT',
        'student@test.logiclab.local',
        'STUDENT@TEST.LOGICLAB.LOCAL',
        '$argon2id$v=19$m=65536,t=3,p=4$dGVzdF9zYWx0$dGVzdF9oYXNo',
        'Test Student',
        'USER',
        'ACTIVE'
    );

    INSERT INTO dbo.UserSettings (UserId, Theme, Language)
    VALUES ('BBBBBBBB-0000-0000-0000-000000000002', 'LIGHT', 'en');
END;

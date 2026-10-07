/* ============================================================
   LOGICLAB DEVELOPMENT SEEDS: Users
   ============================================================ */

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE NormalizedUsername = 'DEMO_USER')
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
        '11111111-1111-1111-1111-111111111111',
        'demo_user',
        'DEMO_USER',
        'demo@logiclab.local',
        'DEMO@LOGICLAB.LOCAL',
        '$2b$10$placeholder_dev_hash_not_used_for_prod',
        'Demo Learner',
        'USER',
        'ACTIVE'
    );
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE NormalizedUsername = 'ADMIN_USER')
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
        '22222222-2222-2222-2222-222222222222',
        'admin_user',
        'ADMIN_USER',
        'admin@logiclab.local',
        'ADMIN@LOGICLAB.LOCAL',
        '$2b$10$placeholder_admin_hash_not_used_for_prod',
        'System Admin',
        'ADMIN',
        'ACTIVE'
    );
END;

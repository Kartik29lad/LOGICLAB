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
        'scrypt$16384$8$1$173aefa1ced84b2a9610251a90df4639$11a6326bbb65b7ebcaa40f0da5cd764870891fe6a7268ddd0241b56e8a7d7f3383679b91e48c79180b2d04a93d6bd2a34d1c59601b5306f5b091a318be34cacd',
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
        'scrypt$16384$8$1$dbe1ebeeb8f5f596e6cdcfb4cfba81c5$05c0f2ab6c9d4546de6d6745d780fd56373e0e6efcbcd2a1ecab44203f99180b040196d14f920215ec30ac5049c156a249c442130d2800cf495b551b54de3f95',
        'System Admin',
        'ADMIN',
        'ACTIVE'
    );
END;

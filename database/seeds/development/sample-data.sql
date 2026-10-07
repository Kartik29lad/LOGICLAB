/* ============================================================
   LOGICLAB DEVELOPMENT SEEDS: ContentItems & ContentVersions
   ============================================================ */

-- Seed Content Items
IF NOT EXISTS (SELECT 1 FROM dbo.ContentItems WHERE Slug = 'bubble-sort' AND ContentType = 'ALGORITHM')
BEGIN
    DECLARE @BubbleSortId UNIQUEIDENTIFIER = '33333333-3333-3333-3333-333333333331';

    INSERT INTO dbo.ContentItems (ContentItemId, ContentType, Slug, DisplayName, IsActive)
    VALUES (@BubbleSortId, 'ALGORITHM', 'bubble-sort', 'Bubble Sort', 1);

    INSERT INTO dbo.ContentVersions (ContentVersionId, ContentItemId, VersionNumber, ContentHash, IsCurrent)
    VALUES (
        '44444444-4444-4444-4444-444444444441',
        @BubbleSortId,
        1,
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        1
    );
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContentItems WHERE Slug = 'binary-search' AND ContentType = 'ALGORITHM')
BEGIN
    DECLARE @BinarySearchId UNIQUEIDENTIFIER = '33333333-3333-3333-3333-333333333332';

    INSERT INTO dbo.ContentItems (ContentItemId, ContentType, Slug, DisplayName, IsActive)
    VALUES (@BinarySearchId, 'ALGORITHM', 'binary-search', 'Binary Search', 1);

    INSERT INTO dbo.ContentVersions (ContentVersionId, ContentItemId, VersionNumber, ContentHash, IsCurrent)
    VALUES (
        '44444444-4444-4444-4444-444444444442',
        @BinarySearchId,
        1,
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b856',
        1
    );
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContentItems WHERE Slug = 'two-sum-challenge' AND ContentType = 'CHALLENGE')
BEGIN
    DECLARE @ChallengeId UNIQUEIDENTIFIER = '33333333-3333-3333-3333-333333333333';

    INSERT INTO dbo.ContentItems (ContentItemId, ContentType, Slug, DisplayName, IsActive)
    VALUES (@ChallengeId, 'CHALLENGE', 'two-sum-challenge', 'Two Sum Challenge', 1);

    INSERT INTO dbo.ContentVersions (ContentVersionId, ContentItemId, VersionNumber, ContentHash, IsCurrent)
    VALUES (
        '44444444-4444-4444-4444-444444444443',
        @ChallengeId,
        1,
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b857',
        1
    );
END;

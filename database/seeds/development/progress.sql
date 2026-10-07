/* ============================================================
   LOGICLAB DEVELOPMENT SEEDS: Progress
   ============================================================ */

DECLARE @DemoUserId UNIQUEIDENTIFIER = '11111111-1111-1111-1111-111111111111';
DECLARE @BubbleSortId UNIQUEIDENTIFIER = '33333333-3333-3333-3333-333333333331';
DECLARE @BubbleSortVersionId UNIQUEIDENTIFIER = '44444444-4444-4444-4444-444444444441';

IF EXISTS (SELECT 1 FROM dbo.Users WHERE UserId = @DemoUserId)
   AND EXISTS (SELECT 1 FROM dbo.ContentItems WHERE ContentItemId = @BubbleSortId)
   AND NOT EXISTS (SELECT 1 FROM dbo.AlgorithmProgress WHERE UserId = @DemoUserId AND ContentItemId = @BubbleSortId)
BEGIN
    INSERT INTO dbo.AlgorithmProgress
    (
        UserId,
        ContentItemId,
        ContentType,
        ContentVersionId,
        Status,
        CompletionPercent,
        TimesViewed,
        TimesStarted,
        TimesCompleted,
        LastStepViewed
    )
    VALUES
    (
        @DemoUserId,
        @BubbleSortId,
        'ALGORITHM',
        @BubbleSortVersionId,
        'COMPLETED',
        100.00,
        5,
        3,
        2,
        42
    );
END;

/* LogicLab Phase 29 — retention maintenance template.
   Review retention periods with the product/privacy owner before enabling.
   This script is intentionally read-only until explicit retention policy values are approved. */

DECLARE @Now DATETIME2(3) = SYSUTCDATETIME();

SELECT
    @Now AS CheckedAt,
    (SELECT COUNT_BIG(*) FROM dbo.UserSessions WHERE ExpiresAt < @Now) AS ExpiredSessions,
    (SELECT COUNT_BIG(*) FROM dbo.History) AS HistoryRows,
    (SELECT COUNT_BIG(*) FROM dbo.Experiments) AS ExperimentRows;

PRINT 'No deletion is performed by this template. Approved retention policies must be encoded in a reviewed migration/job before destructive cleanup is enabled.';

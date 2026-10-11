/* LogicLab Phase 29 — production data integrity checks.
   Run read-only. Review results before taking corrective action. */

SET NOCOUNT ON;

SELECT 'Orphaned Progress -> Users' AS CheckName, COUNT_BIG(*) AS Violations
FROM dbo.Progress p
LEFT JOIN dbo.Users u ON u.UserId = p.UserId
WHERE u.UserId IS NULL
UNION ALL
SELECT 'Orphaned Favorites -> Users', COUNT_BIG(*)
FROM dbo.Favorites f
LEFT JOIN dbo.Users u ON u.UserId = f.UserId
WHERE u.UserId IS NULL
UNION ALL
SELECT 'Orphaned History -> Users', COUNT_BIG(*)
FROM dbo.History h
LEFT JOIN dbo.Users u ON u.UserId = h.UserId
WHERE u.UserId IS NULL
UNION ALL
SELECT 'Orphaned Sessions -> Users', COUNT_BIG(*)
FROM dbo.UserSessions s
LEFT JOIN dbo.Users u ON u.UserId = s.UserId
WHERE u.UserId IS NULL;

SELECT 'Expired Active Sessions' AS CheckName, COUNT_BIG(*) AS Candidates
FROM dbo.UserSessions
WHERE RevokedAt IS NULL AND ExpiresAt < SYSUTCDATETIME();

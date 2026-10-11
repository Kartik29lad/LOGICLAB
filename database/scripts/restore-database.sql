/* LogicLab Phase 26 — controlled restore template.

   NEVER run against the live production database as an ad-hoc command.
   Restore into an isolated recovery database first, validate it, then follow
   the approved production recovery/cutover runbook.
*/
DECLARE @BackupFile nvarchar(4000) = N'C:\LogicLabBackups\LogicLab_FULL.bak';
DECLARE @RecoveryDatabase sysname = N'LogicLab_Recovery';
DECLARE @Sql nvarchar(max);

SET @Sql = N'RESTORE DATABASE ' + QUOTENAME(@RecoveryDatabase)
    + N' FROM DISK = ' + QUOTENAME(@BackupFile, '''')
    + N' WITH REPLACE, RECOVERY, STATS = 10;';

EXEC sys.sp_executesql @Sql;

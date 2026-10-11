/* LogicLab Phase 26 — SQL Server full backup template.

   IMPORTANT:
   - Replace the database name/path with deployment-managed values.
   - The SQL Server service account must be able to write to the backup target.
   - Do not commit production backup paths containing credentials or secrets.
   - For Azure SQL/managed providers, use the provider's managed backup/PITR service
     instead of executing BACKUP DATABASE when the platform does not support it.
*/

DECLARE @DatabaseName sysname = DB_NAME();
DECLARE @BackupFile nvarchar(4000) = N'C:\LogicLabBackups\LogicLab_FULL.bak';
DECLARE @Sql nvarchar(max);

SET @Sql = N'BACKUP DATABASE ' + QUOTENAME(@DatabaseName)
    + N' TO DISK = ' + QUOTENAME(@BackupFile, '''')
    + N' WITH CHECKSUM, INIT, STATS = 10;';

EXEC sys.sp_executesql @Sql;

/* LogicLab Phase 26 — SQL Server backup verification template.
   Run against a controlled recovery/verification environment.
*/
DECLARE @BackupFile nvarchar(4000) = N'C:\LogicLabBackups\LogicLab_FULL.bak';

RESTORE VERIFYONLY
FROM DISK = @BackupFile
WITH CHECKSUM;

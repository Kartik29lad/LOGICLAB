import type sql from "mssql";

import { executeQuery, withTransaction } from "../../server/database/connection";
import { calculateContentHash } from "../schema/content-hash";
import type { ContentPackage, DatabaseContentType } from "../schema/content-types";
import { validateContentPackage } from "../schema/content-validator";

interface ExistingItem {
  ContentItemId: string;
  ContentType: DatabaseContentType;
  Slug: string;
  DisplayName: string;
  IsActive: boolean;
}
interface ExistingVersion {
  ContentVersionId: string;
  ContentItemId: string;
  VersionNumber: number;
  ContentHash: string;
  IsCurrent: boolean;
}

export interface ContentSyncOptions {
  mode: "development" | "staging" | "production";
  dryRun?: boolean;
  confirmProduction?: boolean;
  retireMissing?: boolean;
}

export interface ContentSyncResult {
  createdItems: number;
  createdVersions: number;
  unchanged: number;
  retired: number;
  dryRun: boolean;
}

function toDatabaseType(type: ContentPackage["metadata"]["type"]): DatabaseContentType {
  return type;
}

export async function synchronizeContent(
  content: ContentPackage[],
  options: ContentSyncOptions
): Promise<ContentSyncResult> {
  if (options.mode === "production" && !options.confirmProduction)
    throw new Error("Production content synchronization requires --confirm-production.");
  for (const item of content) {
    const issues = validateContentPackage(item);
    if (issues.length)
      throw new Error(
        `Cannot synchronize ${item.metadata.slug}: ${issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`
      );
    toDatabaseType(item.metadata.type);
  }
  if (options.dryRun) return preview(content, options);
  return withTransaction(async (transaction) => executeSync(transaction, content, options));
}

export interface ContentSyncMismatch {
  slug: string;
  reason:
    | "MISSING_ITEM"
    | "HASH_MISMATCH"
    | "MISSING_CURRENT_VERSION"
    | "UNEXPECTED_ACTIVE_ITEM"
    | "ACTIVE_STATE_MISMATCH"
    | "DISPLAY_NAME_MISMATCH";
}

export async function verifyContentSynchronization(
  content: ContentPackage[]
): Promise<ContentSyncMismatch[]> {
  const rows = await executeQuery<{
    ContentItemId: string;
    ContentType: string;
    Slug: string;
    DisplayName: string;
    IsActive: boolean;
    VersionNumber: number | null;
    ContentHash: string | null;
  }>(`
    SELECT ci.ContentItemId, ci.ContentType, ci.Slug, ci.IsActive, ci.DisplayName, cv.VersionNumber, cv.ContentHash
    FROM dbo.ContentItems ci
    LEFT JOIN dbo.ContentVersions cv ON cv.ContentItemId = ci.ContentItemId AND cv.IsCurrent = 1;
  `);
  const mismatches: ContentSyncMismatch[] = [];
  const sourceKeys = new Set<string>();
  for (const item of content) {
    const type = toDatabaseType(item.metadata.type);
    sourceKeys.add(`${type}:${item.metadata.slug}`);
    const row = rows.find(
      (candidate) => candidate.ContentType === type && candidate.Slug === item.metadata.slug
    );
    if (!row) {
      mismatches.push({ slug: item.metadata.slug, reason: "MISSING_ITEM" });
      continue;
    }
    if (row.VersionNumber === null || row.ContentHash === null) {
      mismatches.push({ slug: item.metadata.slug, reason: "MISSING_CURRENT_VERSION" });
      continue;
    }
    if (row.IsActive !== item.metadata.isActive)
      mismatches.push({ slug: item.metadata.slug, reason: "ACTIVE_STATE_MISMATCH" });
    if (row.DisplayName !== item.metadata.title)
      mismatches.push({ slug: item.metadata.slug, reason: "DISPLAY_NAME_MISMATCH" });
    if (row.ContentHash !== calculateContentHash(item))
      mismatches.push({ slug: item.metadata.slug, reason: "HASH_MISMATCH" });
  }
  for (const row of rows) {
    if (row.IsActive && !sourceKeys.has(`${row.ContentType}:${row.Slug}`))
      mismatches.push({ slug: row.Slug, reason: "UNEXPECTED_ACTIVE_ITEM" });
  }
  return mismatches;
}

async function executeSync(
  transaction: sql.Transaction,
  content: ContentPackage[],
  options: ContentSyncOptions
): Promise<ContentSyncResult> {
  const lock = await transaction
    .request()
    .input("resource", "LogicLab.ContentSynchronization")
    .query<{ ResultCode: number }>(
      "DECLARE @result INT; EXEC @result = sp_getapplock @Resource=@resource, @LockMode='Exclusive', @LockOwner='Transaction', @LockTimeout=10000; SELECT @result AS ResultCode;"
    );
  if ((lock.recordset[0]?.ResultCode ?? -999) < 0)
    throw new Error("Could not acquire the content synchronization lock.");
  const request = transaction.request();
  const items = await request.query<ExistingItem>(
    "SELECT ContentItemId, ContentType, Slug, IsActive FROM dbo.ContentItems;"
  );
  let createdItems = 0;
  let createdVersions = 0;
  let unchanged = 0;
  let retired = 0;
  const sourceKeys = new Set<string>();

  for (const item of content) {
    const type = toDatabaseType(item.metadata.type);
    const key = `${type}:${item.metadata.slug}`;
    sourceKeys.add(key);
    const existing = items.recordset.find(
      (row: ExistingItem) => row.ContentType === type && row.Slug === item.metadata.slug
    );
    let contentItemId = existing?.ContentItemId;
    if (!contentItemId) {
      const inserted = await transaction
        .request()
        .input("type", type)
        .input("slug", item.metadata.slug)
        .input("displayName", item.metadata.title)
        .input("isActive", item.metadata.isActive)
        .query<{ ContentItemId: string }>(
          "INSERT dbo.ContentItems (ContentType, Slug, DisplayName, IsActive) OUTPUT INSERTED.ContentItemId VALUES (@type, @slug, @displayName, @isActive);"
        );
      contentItemId = inserted.recordset[0].ContentItemId;
      createdItems += 1;
    } else if (existing && existing.IsActive !== item.metadata.isActive) {
      await transaction
        .request()
        .input("id", contentItemId)
        .input("displayName", item.metadata.title)
        .input("isActive", item.metadata.isActive)
        .query(
          "UPDATE dbo.ContentItems SET DisplayName = @displayName, IsActive = @isActive, UpdatedAt = SYSUTCDATETIME() WHERE ContentItemId = @id;"
        );
    }

    const versions = await transaction
      .request()
      .input("itemId", contentItemId)
      .query<ExistingVersion>(
        "SELECT ContentVersionId, ContentItemId, VersionNumber, ContentHash, IsCurrent FROM dbo.ContentVersions WHERE ContentItemId = @itemId ORDER BY VersionNumber DESC;"
      );
    const hash = calculateContentHash(item);
    const current = versions.recordset.find((row: ExistingVersion) => row.IsCurrent);
    if (current?.ContentHash === hash) {
      unchanged += 1;
      continue;
    }
    const nextVersion = (versions.recordset[0]?.VersionNumber ?? 0) + 1;
    await transaction
      .request()
      .input("itemId", contentItemId)
      .query(
        "UPDATE dbo.ContentVersions SET IsCurrent = 0 WHERE ContentItemId = @itemId AND IsCurrent = 1;"
      );
    await transaction
      .request()
      .input("itemId", contentItemId)
      .input("version", nextVersion)
      .input("hash", hash)
      .query(
        "INSERT dbo.ContentVersions (ContentItemId, VersionNumber, ContentHash, PublishedAt, IsCurrent) VALUES (@itemId, @version, @hash, SYSUTCDATETIME(), 1);"
      );
    createdVersions += 1;
  }

  if (options.retireMissing) {
    for (const row of items.recordset) {
      if (!sourceKeys.has(`${row.ContentType}:${row.Slug}`) && row.IsActive) {
        await transaction
          .request()
          .input("id", row.ContentItemId)
          .query(
            "UPDATE dbo.ContentItems SET IsActive = 0, UpdatedAt = SYSUTCDATETIME() WHERE ContentItemId = @id;"
          );
        retired += 1;
      }
    }
  }
  return { createdItems, createdVersions, unchanged, retired, dryRun: false };
}

async function preview(
  content: ContentPackage[],
  options: ContentSyncOptions
): Promise<ContentSyncResult> {
  void options;
  return {
    createdItems: content.filter((item) => item.metadata.type !== "CONCEPT_EXPLANATION").length,
    createdVersions: content.filter((item) => item.metadata.type !== "CONCEPT_EXPLANATION").length,
    unchanged: 0,
    retired: 0,
    dryRun: true,
  };
}

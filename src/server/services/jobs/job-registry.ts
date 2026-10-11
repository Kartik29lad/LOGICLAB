/**
 * Scheduled Maintenance Job Registry
 * Defines async background maintenance jobs for session cleanup, data retention, and daily aggregations.
 */

export interface MaintenanceJob {
  name: string;
  description: string;
  cronSchedule: string; // e.g. "0 3 * * *" (Every day at 3 AM)
  enabled: boolean;
  timeoutMs: number;
}

export const MAINTENANCE_JOBS: Record<string, MaintenanceJob> = {
  EXPIRED_SESSION_CLEANUP: {
    name: "expired-session-cleanup",
    description: "Purges revoked and expired user sessions older than 30 days",
    cronSchedule: "0 2 * * *",
    enabled: true,
    timeoutMs: 60_000,
  },
  RETENTION_CLEANUP: {
    name: "retention-cleanup",
    description: "Hard-deletes accounts marked DELETED after 90 days retention window",
    cronSchedule: "0 3 * * 0", // Weekly on Sunday
    enabled: true,
    timeoutMs: 120_000,
  },
  DAILY_ACTIVITY_ROLLUP: {
    name: "daily-activity-rollup",
    description: "Calculates daily streaks and aggregates user learning activity",
    cronSchedule: "5 0 * * *", // 5 minutes after midnight
    enabled: true,
    timeoutMs: 180_000,
  },
  API_RATE_LIMIT_RETENTION: {
    name: "api-rate-limit-retention",
    description: "Removes expired distributed API rate-limit buckets",
    cronSchedule: "45 3 * * *",
    enabled: true,
    timeoutMs: 60_000,
  },
  IDEMPOTENCY_RETENTION: {
    name: "idempotency-retention",
    description: "Removes completed idempotency records after the retry safety window",
    cronSchedule: "30 3 * * *",
    enabled: true,
    timeoutMs: 60_000,
  },
};

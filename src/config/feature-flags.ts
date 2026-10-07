import type { AppEnvironment } from "./env";

export interface FeatureFlagDefinition {
  key: string;
  name: string;
  description: string;
  owner: string;
  targetRemovalDate: string;
  defaultValue: boolean;
  environmentOverrides?: Partial<Record<AppEnvironment, boolean>>;
}

export const FEATURE_FLAGS: Record<string, FeatureFlagDefinition> = {
  ENABLE_WEB_WORKER_EXECUTION: {
    key: "ENABLE_WEB_WORKER_EXECUTION",
    name: "Web Worker Execution",
    description: "Executes heavy sorting and graph algorithms in background Web Workers",
    owner: "team-core",
    targetRemovalDate: "2027-01-01",
    defaultValue: true,
  },
  ENABLE_ADVANCED_BENCHMARKS: {
    key: "ENABLE_ADVANCED_BENCHMARKS",
    name: "Advanced Algorithm Benchmarks",
    description: "Enables multi-dataset benchmark comparison tool",
    owner: "team-experiments",
    targetRemovalDate: "2026-12-01",
    defaultValue: false,
    environmentOverrides: {
      development: true,
      test: true,
    },
  },
  ENABLE_COMMUNITY_CHALLENGES: {
    key: "ENABLE_COMMUNITY_CHALLENGES",
    name: "Community Challenge Sharing",
    description: "Allows users to create and share custom algorithm challenges",
    owner: "team-challenges",
    targetRemovalDate: "2027-03-01",
    defaultValue: false,
  },
  ENABLE_SQL_AUDIT_LOGGING: {
    key: "ENABLE_SQL_AUDIT_LOGGING",
    name: "Detailed SQL Audit Logging",
    description: "Emits structured SQL execution traces to the server logger",
    owner: "team-platform",
    targetRemovalDate: "permanent",
    defaultValue: false,
    environmentOverrides: {
      development: true,
    },
  },
};

/**
 * Checks if a specific feature flag is active in the current execution environment.
 */
export function isFeatureFlagEnabled(
  flagKey: keyof typeof FEATURE_FLAGS | string,
  environment: AppEnvironment = (process.env.NODE_ENV as AppEnvironment) ?? "development"
): boolean {
  // Allow explicit process.env override (e.g. FEATURE_ENABLE_WEB_WORKER_EXECUTION=false)
  const envVarKey = `FEATURE_${flagKey}`;
  if (process.env[envVarKey] !== undefined) {
    return process.env[envVarKey] === "true" || process.env[envVarKey] === "1";
  }

  const flag = FEATURE_FLAGS[flagKey];
  if (!flag) return false;

  if (flag.environmentOverrides && flag.environmentOverrides[environment] !== undefined) {
    return flag.environmentOverrides[environment]!;
  }

  return flag.defaultValue;
}

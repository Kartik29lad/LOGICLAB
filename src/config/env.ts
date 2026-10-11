/**
 * Environment configuration validator and access layer.
 *
 * Development/test may use safe local defaults. Staging/production are strict:
 * required infrastructure and security values must be explicitly configured.
 */

export type AppEnvironment = "development" | "test" | "staging" | "production";
export type EnvironmentDatabaseAuthMode = "sql" | "windows";

export interface EnvironmentConfig {
  nodeEnv: AppEnvironment;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  isStaging: boolean;
  port: number;
  appUrl: string;
  database: {
    host: string;
    port: number;
    name: string;
    authMode: EnvironmentDatabaseAuthMode;
    user?: string;
    password?: string;
    odbcDriver: string;
    encrypt: boolean;
    trustServerCertificate: boolean;
  };
  security: {
    sessionSecret: string;
    sessionDurationSeconds: number;
    corsAllowedOrigins: string[];
  };
  limits: {
    maxExecutionSteps: number;
    maxExecutionTimeMs: number;
    maxPayloadSizeBytes: number;
  };
}

let cachedEnv: EnvironmentConfig | null = null;

function requiredString(name: string, value: string | undefined): string {
  const normalized = value?.trim();
  if (!normalized) throw new Error(`[CONFIG ERROR] ${name} is required.`);
  return normalized;
}

function positiveInt(name: string, value: string | undefined, fallback?: number): number {
  const raw = value ?? (fallback === undefined ? undefined : String(fallback));
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`[CONFIG ERROR] ${name} must be a positive integer.`);
  }
  return parsed;
}

function port(name: string, value: string | undefined, fallback?: number): number {
  const parsed = positiveInt(name, value, fallback);
  if (parsed > 65535) throw new Error(`[CONFIG ERROR] ${name} must be between 1 and 65535.`);
  return parsed;
}

function booleanValue(name: string, value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1") return true;
  if (normalized === "false" || normalized === "0") return false;
  throw new Error(`[CONFIG ERROR] ${name} must be true/false or 1/0.`);
}

function appEnvironment(raw: string | undefined): AppEnvironment {
  const value = raw ?? "development";
  if (["development", "test", "staging", "production"].includes(value)) {
    return value as AppEnvironment;
  }
  throw new Error(`[CONFIG ERROR] NODE_ENV must be development, test, staging, or production.`);
}

function httpUrl(name: string, value: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`[CONFIG ERROR] ${name} must be a valid absolute URL.`);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`[CONFIG ERROR] ${name} must use http:// or https://.`);
  }
  return parsed.origin;
}

function origins(value: string): string[] {
  const entries = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (entries.length === 0) throw new Error("[CONFIG ERROR] CORS_ALLOWED_ORIGINS cannot be empty.");
  return entries.map((item) => httpUrl("CORS_ALLOWED_ORIGINS", item));
}

function sessionSecret(nodeEnv: AppEnvironment): string {
  const value = process.env.SESSION_SECRET?.trim();
  if (!value) {
    if (nodeEnv === "development" || nodeEnv === "test") {
      return "development_only_insecure_secret_key_32chars!";
    }
    throw new Error("[SECURITY CONFIG ERROR] SESSION_SECRET is required outside development/test.");
  }

  if (value.length < 32) {
    throw new Error("[SECURITY CONFIG ERROR] SESSION_SECRET must contain at least 32 characters.");
  }
  if (/development_only/i.test(value) && (nodeEnv === "production" || nodeEnv === "staging")) {
    throw new Error(
      "[SECURITY CONFIG ERROR] Insecure SESSION_SECRET cannot be used in staging/production."
    );
  }
  return value;
}

function database(nodeEnv: AppEnvironment): EnvironmentConfig["database"] {
  const strict = nodeEnv === "staging" || nodeEnv === "production";
  const host = strict
    ? requiredString("DB_HOST", process.env.DB_HOST)
    : process.env.DB_HOST?.trim() || "localhost";
  const name = strict
    ? requiredString("DB_NAME", process.env.DB_NAME)
    : process.env.DB_NAME?.trim() || "LogicLab_Development";
  const dbPort = port("DB_PORT", process.env.DB_PORT, 1433);
  const rawAuthMode = (process.env.DB_AUTH_MODE ?? "sql").trim().toLowerCase();
  if (rawAuthMode !== "sql" && rawAuthMode !== "windows") {
    throw new Error("[DATABASE CONFIG ERROR] DB_AUTH_MODE must be either sql or windows.");
  }
  const authMode = rawAuthMode as EnvironmentDatabaseAuthMode;
  const user = process.env.DB_USER?.trim() || undefined;
  const password = process.env.DB_PASSWORD || undefined;
  if (strict && authMode === "sql" && (!user || !password)) {
    throw new Error(
      "[DATABASE CONFIG ERROR] SQL authentication requires DB_USER and DB_PASSWORD in staging/production."
    );
  }
  const odbcDriver = process.env.DB_ODBC_DRIVER?.trim() || "ODBC Driver 18 for SQL Server";
  if (!odbcDriver) throw new Error("[DATABASE CONFIG ERROR] DB_ODBC_DRIVER cannot be empty.");

  return {
    host,
    port: dbPort,
    name,
    authMode,
    user,
    password,
    odbcDriver,
    encrypt: booleanValue(
      "DB_ENCRYPT",
      process.env.DB_ENCRYPT,
      nodeEnv !== "development" && nodeEnv !== "test"
    ),
    trustServerCertificate: booleanValue(
      "DB_TRUST_SERVER_CERTIFICATE",
      process.env.DB_TRUST_SERVER_CERTIFICATE,
      nodeEnv === "development" || nodeEnv === "test"
    ),
  };
}

export function parseEnvironment(): EnvironmentConfig {
  if (cachedEnv) return cachedEnv;

  const nodeEnv = appEnvironment(process.env.NODE_ENV);
  const appPort = port("PORT", process.env.PORT, 3000);
  const strict = nodeEnv === "staging" || nodeEnv === "production";
  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const appUrl = strict
    ? httpUrl("NEXT_PUBLIC_APP_URL", requiredString("NEXT_PUBLIC_APP_URL", rawAppUrl))
    : httpUrl("NEXT_PUBLIC_APP_URL", rawAppUrl || `http://localhost:${appPort}`);

  const sessionDurationSeconds = positiveInt(
    "SESSION_DURATION_SECONDS",
    process.env.SESSION_DURATION_SECONDS,
    604800
  );
  const maxExecutionSteps = positiveInt(
    "MAX_EXECUTION_STEPS",
    process.env.MAX_EXECUTION_STEPS,
    10000
  );
  const maxExecutionTimeMs = positiveInt(
    "MAX_EXECUTION_TIME_MS",
    process.env.MAX_EXECUTION_TIME_MS,
    5000
  );
  const maxPayloadSizeBytes = positiveInt(
    "MAX_PAYLOAD_SIZE_BYTES",
    process.env.MAX_PAYLOAD_SIZE_BYTES,
    1048576
  );

  const corsRaw = process.env.CORS_ALLOWED_ORIGINS?.trim() || appUrl;
  const config: EnvironmentConfig = {
    nodeEnv,
    isProduction: nodeEnv === "production",
    isDevelopment: nodeEnv === "development",
    isTest: nodeEnv === "test",
    isStaging: nodeEnv === "staging",
    port: appPort,
    appUrl,
    database: database(nodeEnv),
    security: {
      sessionSecret: sessionSecret(nodeEnv),
      sessionDurationSeconds,
      corsAllowedOrigins: origins(corsRaw),
    },
    limits: {
      maxExecutionSteps,
      maxExecutionTimeMs,
      maxPayloadSizeBytes,
    },
  };

  cachedEnv = config;
  return config;
}

export function resetEnvironmentCache(): void {
  cachedEnv = null;
}

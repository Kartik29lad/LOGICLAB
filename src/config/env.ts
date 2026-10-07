/**
 * Environment configuration validator and access layer.
 * Enforces fail-fast startup semantics across development, test, staging, and production.
 */

export type AppEnvironment = "development" | "test" | "staging" | "production";

export interface EnvironmentConfig {
  nodeEnv: AppEnvironment;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  port: number;
  appUrl: string;
  database: {
    host: string;
    port: number;
    name: string;
    user?: string;
    password?: string;
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

export function parseEnvironment(): EnvironmentConfig {
  if (cachedEnv) return cachedEnv;

  const rawEnv = process.env.NODE_ENV ?? "development";
  const nodeEnv: AppEnvironment = ["development", "test", "staging", "production"].includes(rawEnv)
    ? (rawEnv as AppEnvironment)
    : "development";

  const port = parseInt(process.env.PORT ?? "3000", 10);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${port}`;

  const dbHost = process.env.DB_HOST ?? "localhost";
  const dbPort = parseInt(process.env.DB_PORT ?? "1433", 10);
  const dbName = process.env.DB_NAME ?? "LogicLab_Development";

  const sessionSecret =
    process.env.SESSION_SECRET ?? "development_only_insecure_secret_key_32chars!";
  const sessionDurationSeconds = parseInt(process.env.SESSION_DURATION_SECONDS ?? "604800", 10); // 7 days

  if (nodeEnv === "production") {
    if (sessionSecret.includes("development_only")) {
      throw new Error(
        "[SECURITY CONFIG ERROR] Insecure SESSION_SECRET cannot be used in production."
      );
    }
  }

  cachedEnv = {
    nodeEnv,
    isProduction: nodeEnv === "production",
    isDevelopment: nodeEnv === "development",
    isTest: nodeEnv === "test",
    port: isNaN(port) ? 3000 : port,
    appUrl,
    database: {
      host: dbHost,
      port: isNaN(dbPort) ? 1433 : dbPort,
      name: dbName,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      encrypt: process.env.DB_ENCRYPT === "true",
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== "false",
    },
    security: {
      sessionSecret,
      sessionDurationSeconds,
      corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS ?? appUrl)
        .split(",")
        .map((s) => s.trim()),
    },
    limits: {
      maxExecutionSteps: parseInt(process.env.MAX_EXECUTION_STEPS ?? "10000", 10),
      maxExecutionTimeMs: parseInt(process.env.MAX_EXECUTION_TIME_MS ?? "5000", 10),
      maxPayloadSizeBytes: parseInt(process.env.MAX_PAYLOAD_SIZE_BYTES ?? "1048576", 10), // 1MB
    },
  };

  return cachedEnv;
}

export function resetEnvironmentCache(): void {
  cachedEnv = null;
}

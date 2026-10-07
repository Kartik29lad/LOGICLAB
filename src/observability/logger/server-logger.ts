export type LogLevel = "debug" | "info" | "warn" | "error";

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /authorization/i,
  /cookie/i,
  /session/i,
  /credit/i,
  /key/i,
];

/**
 * Recursively scrubs sensitive data fields from structured log payloads.
 */
export function sanitizeLogData(data: unknown, depth = 0): unknown {
  if (depth > 5) return "[MAX_DEPTH]";
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    // Redact potential connection string credentials
    if (data.includes("Password=") || data.includes("pwd=")) {
      return data.replace(/(?:Password|pwd)=[^;]+/gi, "$1=[REDACTED]");
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item, depth + 1));
  }

  if (typeof data === "object") {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
      if (isSensitive) {
        sanitizedObj[key] = "[REDACTED]";
      } else {
        sanitizedObj[key] = sanitizeLogData(value, depth + 1);
      }
    }
    return sanitizedObj;
  }

  return data;
}

export class ServerLogger {
  private formatLog(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...(meta && { meta: sanitizeLogData(meta) }),
    };
    return JSON.stringify(entry);
  }

  public debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.formatLog("debug", message, meta));
    }
  }

  public info(message: string, meta?: Record<string, unknown>): void {
    console.info(this.formatLog("info", message, meta));
  }

  public warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(this.formatLog("warn", message, meta));
  }

  public error(message: string, meta?: Record<string, unknown>): void {
    console.error(this.formatLog("error", message, meta));
  }
}

export const serverLogger = new ServerLogger();

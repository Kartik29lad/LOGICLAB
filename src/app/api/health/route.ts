import { NextResponse } from "next/server";

import { APPLICATION_CONFIG } from "../../../config/application";
import { parseEnvironment } from "../../../config/env";
import { getPool } from "../../../server/database/connection";

export async function GET(): Promise<NextResponse> {
  const env = parseEnvironment();
  let dbStatus = "unknown";
  let dbLatencyMs: number | null = null;

  try {
    const start = performance.now();
    const pool = await getPool();
    await pool.request().query("SELECT 1 AS health");
    dbLatencyMs = Math.round((performance.now() - start) * 100) / 100;
    dbStatus = "connected";
  } catch {
    dbStatus = "disconnected";
  }

  const payload = {
    service: APPLICATION_CONFIG.identity.name,
    version: APPLICATION_CONFIG.identity.version,
    status: dbStatus === "connected" ? "healthy" : "degraded",
    environment: env.nodeEnv,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    components: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
    },
  };

  const statusCode = dbStatus === "connected" ? 200 : 503;
  return NextResponse.json(payload, { status: statusCode });
}

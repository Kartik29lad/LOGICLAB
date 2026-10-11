import { NextResponse } from "next/server";

import { serverLogger } from "../../observability/logger/server-logger";
import { getPool } from "../../server/database/connection";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const pool = await getPool();
    await pool.request().query("SELECT 1 AS ready");

    return NextResponse.json(
      {
        status: "ready",
        database: "connected",
        timestamp: new Date().toISOString(),
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    serverLogger.error("Readiness check failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        status: "not_ready",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}

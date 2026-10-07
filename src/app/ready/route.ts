import { NextResponse } from "next/server";

import { getPool } from "../../server/database/connection";

export async function GET(): Promise<NextResponse> {
  try {
    const pool = await getPool();
    await pool.request().query("SELECT 1 AS ready");

    return NextResponse.json({
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "not_ready",
        database: "disconnected",
        error: (err as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

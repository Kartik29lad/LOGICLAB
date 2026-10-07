import { NextResponse } from "next/server";

export function GET(): NextResponse {
  return NextResponse.json({
    status: "alive",
    timestamp: new Date().toISOString(),
  });
}

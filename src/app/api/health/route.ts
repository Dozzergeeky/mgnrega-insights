import { NextResponse } from "next/server";

import { getMongoDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getMongoDb();
    const { ok } = await db.command({ ping: 1 });

    return NextResponse.json({
      status: ok === 1 ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed", error);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

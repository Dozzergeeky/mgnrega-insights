import { NextResponse } from "next/server";

import { listDistricts } from "@/lib/districts";

export async function GET() {
  const districts = await listDistricts();
  return NextResponse.json({
    state: districts[0]?.stateName ?? "",
    count: districts.length,
    districts,
    timestamp: new Date().toISOString(),
  });
}

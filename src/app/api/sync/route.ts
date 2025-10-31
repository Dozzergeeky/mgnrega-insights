import { NextResponse } from "next/server";

import { listDistricts } from "@/lib/districts";
import { env } from "@/lib/env";
import { formatPeriod, fetchMonthlyDistrictPerformance } from "@/lib/mgnrega";
import { getMongoClient, getMongoDb } from "@/lib/mongodb";
import type { District } from "@/types/district";
import type { Collection } from "mongodb";

interface DistrictMetricDocument {
  districtCode: string;
  districtName: string;
  stateCode: string;
  stateName: string;
  period: string;
  records: unknown[];
  lastSyncedAt: Date;
}

function isVercelCron(req: Request) {
  // Vercel sets this header for scheduled invocations
  return Boolean(req.headers.get("x-vercel-cron"));
}

function isAuthorized(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : "";
  const hasSecret = typeof process.env.SYNC_SECRET === "string" && process.env.SYNC_SECRET.length > 0;

  if (isVercelCron(req)) return true; // allow Vercel Cron invocations
  if (hasSecret && token === process.env.SYNC_SECRET) return true;

  return false;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!env.MGNREGA_API_KEY || !env.MGNREGA_RESOURCE_ID) {
      return NextResponse.json(
        { error: "MGNREGA_API_KEY and MGNREGA_RESOURCE_ID must be set" },
        { status: 400 }
      );
    }

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1; // 1-12

    const client = await getMongoClient();
    const startedAt = new Date();

    try {
      const db = await getMongoDb();
      const collection = db.collection<DistrictMetricDocument>("district_metrics");

      await collection.createIndex({ districtCode: 1, period: 1 }, { unique: true });

      const districts = await listDistricts();
      const period = formatPeriod(year, month);

      const results = {
        period,
        totalDistricts: districts.length,
        successes: 0,
        failures: 0,
        details: [] as Array<{ district: string; code: string; records?: number; error?: string }>,
      };

      for (const district of districts) {
        try {
          const records = await fetchMonthlyDistrictPerformance({
            districtCode: district.code,
            year,
            month,
          });

          if (!Array.isArray(records) || records.length === 0) {
            results.details.push({ district: district.name, code: district.code, records: 0 });
            continue;
          }

          await upsertDistrict(collection, district, period, records);
          results.successes += 1;
          results.details.push({ district: district.name, code: district.code, records: records.length });
        } catch (err) {
          results.failures += 1;
          const message = err instanceof Error ? err.message : String(err);
          results.details.push({ district: district.name, code: district.code, error: message });
        }
      }

      const finishedAt = new Date();
      return NextResponse.json({ startedAt, finishedAt, ...results });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("/api/sync failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

async function upsertDistrict(
  collection: Collection<DistrictMetricDocument>,
  district: District,
  period: string,
  records: unknown[]
) {
  await collection.updateOne(
    { districtCode: district.code, period },
    {
      $set: {
        districtCode: district.code,
        districtName: district.name,
        stateCode: district.stateCode,
        stateName: district.stateName,
        period,
        records,
        lastSyncedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

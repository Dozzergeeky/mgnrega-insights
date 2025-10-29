import process from "node:process";

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

function parseArg(index: number, fallback: number) {
  const raw = process.argv[index];
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value)) {
    throw new Error(`Invalid numeric argument at position ${index}: ${raw}`);
  }
  return value;
}

async function syncMonthlyDataset(year: number, month: number) {
  if (!env.MGNREGA_API_KEY || !env.MGNREGA_RESOURCE_ID) {
    throw new Error("MGNREGA_API_KEY and MGNREGA_RESOURCE_ID must be set before syncing data");
  }

  const client = await getMongoClient();

  try {
    const db = await getMongoDb();
    const collection = db.collection<DistrictMetricDocument>("district_metrics");

    await collection.createIndex({ districtCode: 1, period: 1 }, { unique: true });

    const districts = await listDistricts();
    const period = formatPeriod(year, month);

    console.log(`Syncing ${districts.length} districts for period ${period}`);

    for (const district of districts) {
      await syncDistrict(collection, district, year, month, period);
    }
  } finally {
    await client.close();
  }
}

async function syncDistrict(
  collection: Collection<DistrictMetricDocument>,
  district: District,
  year: number,
  month: number,
  period: string
) {
  try {
    const records = await fetchMonthlyDistrictPerformance({
      districtCode: district.code,
      year,
      month,
    });

    if (records.length === 0) {
      console.warn(`No records returned for ${district.name} (${period}).`);
      return;
    }

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

    console.log(`✔ Synced ${district.name} (${period}) with ${records.length} rows.`);
  } catch (error) {
    console.error(`✖ Failed to sync ${district.name} (${period})`, error);
  }
}

const now = new Date();
const defaultYear = now.getFullYear();
const defaultMonth = now.getMonth() + 1;

const year = parseArg(2, defaultYear);
const month = parseArg(3, defaultMonth);

syncMonthlyDataset(year, month)
  .then(() => {
    console.log("✅ Sync complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Sync failed", error);
    process.exit(1);
  });

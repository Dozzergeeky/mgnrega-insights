import process from "node:process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env.local manually for standalone scripts (must be before other imports)
const envPath = resolve(process.cwd(), '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
  console.log('Loaded .env.local');
  console.log('MGNREGA_API_KEY:', process.env.MGNREGA_API_KEY ? 'SET' : 'NOT SET');
  console.log('MGNREGA_RESOURCE_ID:', process.env.MGNREGA_RESOURCE_ID ? 'SET' : 'NOT SET');
} catch (error) {
  console.warn('Could not load .env.local:', error instanceof Error ? error.message : String(error));
}

import { listDistricts } from "@/lib/districts";
import { formatPeriod, fetchMonthlyDistrictPerformance } from "@/lib/mgnrega";
import { getMongoClient, getMongoDb } from "@/lib/mongodb";

interface DistrictMetricDocument {
  districtCode: string;
  districtName: string;
  stateCode: string;
  stateName: string;
  period: string;
  records: unknown[];
  lastSyncedAt: Date;
}

async function syncHistoricalData(monthsBack: number = 12) {
  console.log('env.MGNREGA_API_KEY:', process.env.MGNREGA_API_KEY ? 'SET' : 'NOT SET');
  console.log('env.MGNREGA_RESOURCE_ID:', process.env.MGNREGA_RESOURCE_ID ? 'SET' : 'NOT SET');
  
  if (!process.env.MGNREGA_API_KEY || !process.env.MGNREGA_RESOURCE_ID) {
    throw new Error("MGNREGA_API_KEY and MGNREGA_RESOURCE_ID must be set before syncing data");
  }

  const client = await getMongoClient();

  try {
    const db = await getMongoDb();
    const collection = db.collection<DistrictMetricDocument>("district_metrics");

    await collection.createIndex({ districtCode: 1, period: 1 }, { unique: true });

    const districts = await listDistricts();
    const now = new Date();
    
    // Generate list of periods to sync (last N months)
    const periods: Array<{ year: number; month: number; period: string }> = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      periods.push({
        year,
        month,
        period: formatPeriod(year, month),
      });
    }

    console.log(`Syncing ${districts.length} districts for ${periods.length} months (${periods[0].period} to ${periods[periods.length - 1].period})`);
    console.log(`Total API calls: ${districts.length * periods.length}`);
    console.log(`Estimated time: ${Math.ceil((districts.length * periods.length * 2) / 60)} minutes`);
    console.log('');

    let successCount = 0;
    let skipCount = 0;
    let noDataCount = 0;
    let errorCount = 0;

    for (const district of districts) {
      console.log(`\nProcessing ${district.name}...`);
      
      for (const { year, month, period } of periods) {
        try {
          // Check if data already exists
          const existing = await collection.findOne({
            districtCode: district.code,
            period,
          });

          if (existing && existing.records && existing.records.length > 0) {
            console.log(`  ⊙ ${period}: Already synced (${existing.records.length} records)`);
            skipCount++;
            continue;
          }

          // Fetch from API
          const records = await fetchMonthlyDistrictPerformance({
            districtCode: district.code,
            year,
            month,
          });

          if (records.length === 0) {
            console.log(`  ⊘ ${period}: No data available from API`);
            noDataCount++;
            continue;
          }

          // Save to MongoDB
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

          console.log(`  ✔ ${period}: Synced ${records.length} records`);
          successCount++;

          // Rate limit: 2 seconds between requests to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`  ✖ ${period}: Error -`, error instanceof Error ? error.message : String(error));
          errorCount++;
        }
      }
    }

    console.log('\n');
    console.log('='.repeat(60));
    console.log('SYNC SUMMARY');
    console.log('='.repeat(60));
    console.log(`✔ Successfully synced: ${successCount} periods`);
    console.log(`⊙ Already existed:     ${skipCount} periods`);
    console.log(`⊘ No data available:   ${noDataCount} periods`);
    console.log(`✖ Errors:              ${errorCount} periods`);
    console.log(`Total processed:       ${successCount + skipCount + noDataCount + errorCount} periods`);
    console.log('='.repeat(60));
  } finally {
    await client.close();
  }
}

// Parse command line argument for number of months (default 12)
const monthsBack = process.argv[2] ? Number.parseInt(process.argv[2], 10) : 12;

if (Number.isNaN(monthsBack) || monthsBack < 1 || monthsBack > 24) {
  console.error('Usage: npm run sync:historical [months]');
  console.error('Example: npm run sync:historical 12');
  console.error('Months must be between 1 and 24');
  process.exit(1);
}

syncHistoricalData(monthsBack)
  .then(() => {
    console.log("\n✅ Historical sync complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Historical sync failed", error);
    process.exit(1);
  });

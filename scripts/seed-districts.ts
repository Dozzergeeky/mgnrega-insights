import process from "node:process";

import { WEST_BENGAL_DISTRICTS } from "@/data/districts-west-bengal";
import { getMongoDb, getMongoClient } from "@/lib/mongodb";
import type { District } from "@/types/district";
import { MongoServerSelectionError } from "mongodb";

async function seedDistricts() {
  let client: Awaited<ReturnType<typeof getMongoClient>> | null = null;

  try {
    client = await getMongoClient();
    const db = await getMongoDb();
    const collection = db.collection<District>("districts");

    await collection.createIndex({ code: 1 }, { unique: true });
    await collection.createIndex({ stateCode: 1, name: 1 }, { unique: true });

    const operations = WEST_BENGAL_DISTRICTS.map((district) => ({
      updateOne: {
        filter: { code: district.code },
        update: { $set: district },
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(operations, { ordered: false });

    console.log(
      `Seeded ${WEST_BENGAL_DISTRICTS.length} districts (matched: ${result.matchedCount}, upserted: ${result.upsertedCount}).`
    );
  } catch (error) {
    if (error instanceof MongoServerSelectionError) {
      console.error(
        `Could not reach MongoDB at ${process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017"}. ` +
          "Start the database first (e.g. npm run db:up) and retry."
      );
    }
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

seedDistricts()
  .then(() => {
    console.log("✅ District seeding complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ District seeding failed", error);
    process.exit(1);
  });

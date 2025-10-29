import { getMongoDb } from "@/lib/mongodb";
import { WEST_BENGAL_DISTRICTS } from "@/data/districts-west-bengal";
import type { District } from "@/types/district";

const COLLECTION_NAME = "districts";
const fallbackDistricts: District[] = WEST_BENGAL_DISTRICTS;

export async function listDistricts(): Promise<District[]> {
  try {
    const db = await getMongoDb();
    const districts = await db
      .collection<District>(COLLECTION_NAME)
      .find({ stateCode: fallbackDistricts[0]?.stateCode }, { projection: { _id: 0 } })
      .sort({ name: 1 })
      .toArray();

    if (districts.length === 0) {
      return fallbackDistricts;
    }

    return districts;
  } catch (error) {
    console.warn("Falling back to static districts", error);
    return fallbackDistricts;
  }
}

export { fallbackDistricts };

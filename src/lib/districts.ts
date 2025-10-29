import { getMongoDb } from "@/lib/mongodb";
import { getPg } from "@/lib/postgres";
import { WEST_BENGAL_DISTRICTS } from "@/data/districts-west-bengal";
import type { District } from "@/types/district";

const COLLECTION_NAME = "districts";
const fallbackDistricts: District[] = WEST_BENGAL_DISTRICTS;

export async function listDistricts(): Promise<District[]> {
  // 1) Try Postgres (Neon) first when configured
  try {
    if (process.env.POSTGRES_URL) {
      const sql = getPg();
      const rows = await sql`
        SELECT code, name, state_code, state_name
        FROM public.districts
        WHERE state_code = ${fallbackDistricts[0]?.stateCode}
        ORDER BY name
      `;

      if ((rows as any[]).length > 0) {
        return (rows as any[]).map((r: any) => ({
          code: r.code,
          name: r.name,
          stateCode: r.state_code,
          stateName: r.state_name,
        }));
      }
    }
  } catch (err) {
    console.warn("Postgres unavailable, falling back to Mongo/static", err);
  }

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

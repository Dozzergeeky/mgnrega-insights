import { getMongoDb } from "@/lib/mongodb";
import { getPg } from "@/lib/postgres";
import { WEST_BENGAL_DISTRICTS } from "@/data/districts-west-bengal";
import type { District } from "@/types/district";

const COLLECTION_NAME = "districts";
const fallbackDistricts: District[] = WEST_BENGAL_DISTRICTS;

interface PostgresDistrictRow {
  code: string;
  name: string;
  state_code: string;
  state_name: string;
}

const isPostgresDistrictRow = (value: unknown): value is PostgresDistrictRow => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.code === "string" &&
    typeof record.name === "string" &&
    typeof record.state_code === "string" &&
    typeof record.state_name === "string"
  );
};

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

      const rowArray = Array.isArray(rows) ? Array.from(rows) : [];
      const districts = rowArray.filter(isPostgresDistrictRow);

      if (districts.length > 0) {
        return districts.map((district) => ({
          code: district.code,
          name: district.name,
          stateCode: district.state_code,
          stateName: district.state_name,
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

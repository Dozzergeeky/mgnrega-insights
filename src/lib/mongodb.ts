import { MongoClient, type Db, type MongoClientOptions } from "mongodb";
import { env } from "@/lib/env";

/**
 * Reuse Mongo connection across hot reloads in development to avoid creating
 * multiple client instances.
 */
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing Mongo connection string");
}

const defaultTimeout = Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS ?? 2000);

const options: MongoClientOptions = {
  serverSelectionTimeoutMS: defaultTimeout,
};

const client = new MongoClient(uri, options);

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

export async function getMongoClient() {
  return clientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const mongoClient = await getMongoClient();
  return mongoClient.db(env.MONGODB_DB);
}

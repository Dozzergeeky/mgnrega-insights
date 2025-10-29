import { neon } from "@neondatabase/serverless";

/**
 * Returns a Neon serverless SQL tagged template bound to POSTGRES_URL.
 * Throws if POSTGRES_URL is not configured.
 */
export function getPg() {
  const url = process.env.POSTGRES_URL;
  if (!url) {
    throw new Error("POSTGRES_URL is not set");
  }
  return neon(url);
}

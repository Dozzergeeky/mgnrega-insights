import { z } from "zod";

const envSchema = z
  .object({
    MONGODB_URI: z
      .string()
      .min(1, "MONGODB_URI is required")
      .default("mongodb://127.0.0.1:27017"),
    MONGODB_DB: z.string().min(1, "MONGODB_DB is required").default("mgnrega"),
  })
  .extend({
    MGNREGA_API_KEY: z.string().optional(),
    MGNREGA_RESOURCE_ID: z.string().optional(),
    MGNREGA_BASE_URL: z.string().url().default("https://api.data.gov.in/resource"),
    MGNREGA_PAGE_SIZE: z.coerce.number().int().positive().default(100),
  });

const parsed = envSchema.safeParse({
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DB: process.env.MONGODB_DB,
  MGNREGA_API_KEY: process.env.MGNREGA_API_KEY,
  MGNREGA_RESOURCE_ID: process.env.MGNREGA_RESOURCE_ID,
  MGNREGA_BASE_URL: process.env.MGNREGA_BASE_URL,
  MGNREGA_PAGE_SIZE: process.env.MGNREGA_PAGE_SIZE,
});

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => issue.message).join(", ");
  throw new Error(`Invalid environment variables: ${issues}`);
}

export const env = parsed.data;

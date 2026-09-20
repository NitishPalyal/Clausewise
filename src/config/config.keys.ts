import dotenv from "dotenv";
import type { CONFIG } from "@/config/config.type.ts";
dotenv.config();

const configKeys: CONFIG = {
  FRONTEND_URL: process.env.FRONTEND_URL || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  REDIS_HOST: process.env.REDIS_HOST || "",
  REDIS_PORT: process.env.REDIS_PORT || "",
  B2_BUCKET_NAME: process.env.B2_BUCKET_NAME || "",
  B2_KEY_ID: process.env.B2_KEY_ID || "",
  B2_APPLICATION_KEY: process.env.B2_APPLICATION_KEY || "",
  B2_ENDPOINT: process.env.B2_ENDPOINT || "",
};

export default configKeys;

import dotenv from "dotenv";
import type { CONFIG } from "@/config/config.type.ts";
dotenv.config();

const configKeys: CONFIG = {
  FRONTEND_URL: process.env.FRONTEND_URL || "",
  SOCKET_PORT: process.env.SOCKET_PORT || "",
  NEXT_PUBLIC_REALTIME_URL: process.env.NEXT_PUBLIC_REALTIME_URL || "",
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  NODE_ENV: process.env.NODE_ENV || "",
  REDIS_HOST: process.env.REDIS_HOST || "",
  REDIS_PORT: process.env.REDIS_PORT || "",
  B2_BUCKET_NAME: process.env.B2_BUCKET_NAME || "",
  B2_KEY_ID: process.env.B2_KEY_ID || "",
  B2_APPLICATION_KEY: process.env.B2_APPLICATION_KEY || "",
  B2_ENDPOINT: process.env.B2_ENDPOINT || "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
};

export default configKeys;

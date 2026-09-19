import dotenv from "dotenv";
import type { CONFIG } from "@/config/config.type.ts";
dotenv.config();

const configKeys: CONFIG = {
  FRONTEND_URL: process.env.FRONTEND_URL || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  PORT: process.env.PORT || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  REDIS_HOST: process.env.REDIS_HOST || "",
  REDIS_PORT: process.env.REDIS_PORT || "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  GOOGLE_USER: process.env.GOOGLE_USER || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN || "",
  B2_BUCKET_NAME: process.env.B2_BUCKET_NAME || "",
  B2_KEY_ID: process.env.B2_KEY_ID || "",
  B2_APPLICATION_KEY: process.env.B2_APPLICATION_KEY || "",
  B2_ENDPOINT: process.env.B2_ENDPOINT || "",
};

export default configKeys;

import { PrismaClient } from "@/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import configKeys from "@/config/config.keys.ts";

const adapter = new PrismaPg({
  connectionString: configKeys.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter,
  // log: ["query", "warn", "error"],
});

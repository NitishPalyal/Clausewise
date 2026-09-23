import { PrismaClient } from "@/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import configKeys from "@/config/config.keys";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: configKeys.DATABASE_URL }),
  });

if (configKeys.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

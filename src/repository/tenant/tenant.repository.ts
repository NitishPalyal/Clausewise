import { prisma } from "@/lib/prisma";

export async function findOne(id: string, clerkUserId: string) {
  return await prisma.tenant.findUnique({
    where: {
      id,
      users: { some: { clerkUserId } },
    },
  });
}

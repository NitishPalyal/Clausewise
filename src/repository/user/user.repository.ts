import { Prisma } from "@/generated/prisma/client";
import type { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export async function findRoleForTenant(
  clerkUserId: string,
  tenantId: string,
): Promise<Role | null> {
  const user = await prisma.user.findFirst({
    where: { clerkUserId, tenantId },
    select: { role: true },
  });

  return user?.role ?? null;
}

export async function findUserTenantId(userId: string) {
  return await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    select: {
      tenantId: true,
    },
  });
}

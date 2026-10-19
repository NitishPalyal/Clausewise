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
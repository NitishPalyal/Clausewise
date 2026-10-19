import { prisma } from "@/lib/prisma";

export async function findDocumentForTenant(
  id: string,
  tenantId: string,
) {
  return prisma.document.findFirst({
    where: { id, tenantId },
    select: { id: true },
  });
}

export async function deleteDocumentForTenant(id: string, tenantId: string) {
  return prisma.$transaction(async (transaction) => {
    const document = await transaction.document.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        versions: {
          select: {
            fileUrl: true,
          },
        },
      },
    });

    if (!document) {
      return null;
    }

    await transaction.document.delete({ where: { id: document.id } });

    return document.versions.map((version) => version.fileUrl);
  });
}

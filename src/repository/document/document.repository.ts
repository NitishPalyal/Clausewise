import { prisma } from "@/lib/prisma";

export async function findDocumentForTenant(id: string, tenantId: string) {
  return prisma.document.findFirst({
    where: { id, tenantId },
    select: { id: true },
  });
}

export async function findDocumentsForTenant(tenantId: string) {
  return prisma.document.findMany({
    where: { tenantId },
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      type: true,
      _count: { select: { versions: true } },
      versions: {
        orderBy: { uploadedAt: "desc" },
        take: 1,
        select: {
          uploadedAt: true,
          versionNumber: true,
          isCurrent: true,
        },
      },
    },
  });
}

export async function findDocumentDetailsForTenant(
  id: string,
  tenantId: string,
) {
  return prisma.document.findFirst({
    where: { id, tenantId },
    select: {
      id: true,
      title: true,
      type: true,
      versions: {
        orderBy: { versionNumber: "desc" },
        select: {
          id: true,
          versionNumber: true,
          uploadedAt: true,
          isCurrent: true,
          status: true,
        },
      },
    },
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
            id: true,
            fileUrl: true,
          },
        },
      },
    });

    if (!document) {
      return null;
    }

    const versionIds = document.versions.map((version) => version.id);
    if (versionIds.length > 0) {
      await transaction.chunk.deleteMany({
        where: { documentVersionId: { in: versionIds } },
      });
      await transaction.documentVersion.deleteMany({
        where: { id: { in: versionIds } },
      });
    }

    await transaction.document.delete({ where: { id: document.id } });

    return document.versions.map((version) => version.fileUrl);
  });
}

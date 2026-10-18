import type { DocumentType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export async function createWithFirstVersion({
  tenantId,
  title,
  type,
  fileUrl,
}: {
  tenantId: string;
  title: string;
  type: DocumentType;
  fileUrl: string;
}) {
  const version = await prisma.documentVersion.create({
    data: {
      versionNumber: 1,
      fileUrl,
      document: {
        create: {
          title,
          type,
          tenant: { connect: { id: tenantId } },
        },
      },
    },
    select: { id: true, documentId: true },
  });

  return { documentId: version.documentId, documentVersionId: version.id };
}

export async function findVersionForTenant(id: string, tenantId: string) {
  return prisma.documentVersion.findFirst({
    where: { id, document: { tenantId } },
    select: { id: true, documentId: true },
  });
}

export async function findDocumentForTenant(
  id: string,
  tenantId: string,
) {
  return prisma.document.findFirst({
    where: { id, tenantId },
    select: { id: true },
  });
}

export async function createNextVersion({
  documentId,
  tenantId,
  fileUrl,
}: {
  documentId: string;
  tenantId: string;
  fileUrl: string;
}) {
  return prisma.$transaction(async (transaction) => {
    const document = await transaction.document.findFirst({
      where: { id: documentId, tenantId },
      select: { id: true },
    });

    if (!document) {
      return null;
    }

    const latestVersion = await transaction.documentVersion.findFirst({
      where: { documentId },
      orderBy: { versionNumber: "desc" },
      select: { versionNumber: true },
    });

    await transaction.documentVersion.updateMany({
      where: { documentId, isCurrent: true },
      data: { isCurrent: false },
    });

    const version = await transaction.documentVersion.create({
      data: {
        documentId,
        versionNumber: (latestVersion?.versionNumber ?? 0) + 1,
        fileUrl,
        isCurrent: true,
      },
      select: { id: true, documentId: true },
    });

    return { documentId: version.documentId, documentVersionId: version.id };
  });
}

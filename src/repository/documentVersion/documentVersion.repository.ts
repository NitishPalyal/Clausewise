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

export async function deleteVersionForTenant(
  documentVersionId: string,
  tenantId: string,
) {
  return prisma.$transaction(async (transaction) => {
    const version = await transaction.documentVersion.findFirst({
      where: { id: documentVersionId, document: { tenantId } },
      select: {
        id: true,
        documentId: true,
        fileUrl: true,
      },
    });

    if (!version) {
      return null;
    }

    await transaction.documentVersion.delete({ where: { id: version.id } });

    const latestVersion = await transaction.documentVersion.findFirst({
      where: { documentId: version.documentId },
      orderBy: { versionNumber: "desc" },
      select: { id: true },
    });

    if (latestVersion) {
      await transaction.documentVersion.updateMany({
        where: { documentId: version.documentId, isCurrent: true },
        data: { isCurrent: false },
      });
      await transaction.documentVersion.update({
        where: { id: latestVersion.id },
        data: { isCurrent: true },
      });
    }

    return { fileUrl: version.fileUrl };
  });
}
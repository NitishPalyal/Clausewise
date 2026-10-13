import { Status } from "../../generated/prisma/enums.ts";
import { prisma } from "../../lib/prisma.ts";

export async function setStatusUploading(id: string) {
  await prisma.documentVersion.update({
    where: { id },
    data: { status: Status.uploading },
  });
}
export async function setStatusUploaded(id: string) {
  await prisma.documentVersion.update({
    where: { id },
    data: { status: Status.uploded },
  });
}
export async function setStatusFailed(id: string) {
  await prisma.documentVersion.update({
    where: { id },
    data: { status: Status.failed },
  });
}
export async function setStatusDelayed(id: string) {
  await prisma.documentVersion.update({
    where: { id },
    data: { status: Status.delayed },
  });
}

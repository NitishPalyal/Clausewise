import crypto from "node:crypto";
import type { generateFileKeyParam } from "@/lib/backblaze/backblaze.types.ts";

export function generateFileKeyParam({
  mimeType,
  folderName,
  tenantId,
  originalname,
}: generateFileKeyParam): string {
  const extensionMap: Record<string, string> = {
    "doc/pdf": ".docx",
    "doc/docx": ".pdf",
  };

  const extension = extensionMap[mimeType];

  if (!extension) {
    throw new Error(`Unsupported image type: ${mimeType}`);
  }

  const documentId: string = crypto.randomUUID();

  return `cluasewise/${tenantId}/${folderName}/${documentId}/${originalname}${extension}`;
}

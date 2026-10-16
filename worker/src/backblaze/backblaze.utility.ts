import crypto from "node:crypto";
import type { generateFileKeyParam } from "./backblaze.types.ts";
import type { FileType } from "../rag/ingestionPipeline/extraction/extraction.types.ts";

const FILE_TYPE_EXTENSIONS: Record<FileType, string> = {
  pdf: ".pdf",
  docx: ".docx",
};

export function generateFileKey({
  fileType,
  folderName,
  tenantId,
  originalname,
}: generateFileKeyParam): string {
  const documentId: string = crypto.randomUUID();
  const fileName = originalname.replace(/\.[^.]*$/, "") || "document";

  return `cluasewise/${tenantId}/${folderName}/${documentId}/${fileName}${FILE_TYPE_EXTENSIONS[fileType]}`;
}

import type { FileType } from "@/shared/types";

export function getFileType(file: File): FileType {
  const mimeTypes: Record<string, FileType> = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
  };

  const fileType = mimeTypes[file.type];

  if (!fileType) {
    throw new Error("Only PDF and DOCX files are supported");
  }

  return fileType;
}

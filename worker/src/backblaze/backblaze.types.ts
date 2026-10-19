import type { FileType } from "../ingestionPipeline/extraction/extraction.types.ts";

export const FILE_TYPE_MIME_TYPES: Record<FileType, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const FolderName = {
  documents: "documents",
} as const;

export type FolderName = (typeof FolderName)[keyof typeof FolderName];

export interface uploadToStorageParam {
  buffer: Buffer;
  fileType: FileType;
  folderName: FolderName;
  originalname: string;
  tenantId: string;
}

export interface generateFileKeyParam {
  fileType: FileType;
  folderName: FolderName;
  tenantId: string;
  originalname: string;
}

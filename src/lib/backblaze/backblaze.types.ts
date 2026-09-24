export interface imageProcessingService {
  jobId: string;
  uploadedImageKey: string;
}

export const SUPPORTED_MIME_TYPES = ["doc/pdf", "doc/docx"] as const;

export type MimeType = (typeof SUPPORTED_MIME_TYPES)[number];

export function isMimeType(value: string): value is MimeType {
  return SUPPORTED_MIME_TYPES.includes(value as MimeType);
}

export const FolderName = {
  documents: "documents",
} as const;

export type FolderName = (typeof FolderName)[keyof typeof FolderName];

export interface uploadToStorageParam {
  buffer: Buffer;
  mimeType: MimeType;
  folderName: FolderName;
  originalname: string;
  tenantId: string;
}

export interface generateFileKeyParam {
  mimeType: MimeType;
  folderName: FolderName;
  tenantId: string;
  originalname: string;
}

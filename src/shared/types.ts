export type FileType = "pdf" | "docx";

export interface DocumentProcessingJobData {
  uploadedFileKey: string;
  fileType: FileType;
  documentVersionId: string;
  tenantId: string;
}

export interface APIResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
  error?: {
    code: string;
    details?: string;
  };
}

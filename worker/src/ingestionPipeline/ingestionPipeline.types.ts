import type { FileType } from "./extraction/extraction.types.ts";

export interface IngestionPipelineParams {
  uploadedFileKey: string;
  documentVersionId: string;
  tenantId: string;
  fileType: FileType;
}

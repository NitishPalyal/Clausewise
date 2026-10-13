import type { FileType } from "./extraction/extraction.types.ts";

export interface IngestionPipelineParams {
  fileBuffer: Buffer;
  fileType: FileType;
  documentVersionId: string;
  tenantId: string;
}

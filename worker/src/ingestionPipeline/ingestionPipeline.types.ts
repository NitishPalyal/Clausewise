import type { FileType } from "./extraction/extraction.types.ts";

export type IngestionStage =
  | "downloading"
  | "extracting"
  | "structuring"
  | "chunking"
  | "embedding"
  | "saving";

export interface IngestionProgress {
  stage: IngestionStage;
  percentage: number;
  message: string;
}

export interface IngestionPipelineParams {
  uploadedFileKey: string;
  documentVersionId: string;
  tenantId: string;
  fileType: FileType;

  onProgress?: (progress: IngestionProgress) => Promise<void>;
}

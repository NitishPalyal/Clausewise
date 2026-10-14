import { FileType } from "@/shared/types";

export interface documentUploadRequest {
  tenantId: string;
  fileType: FileType;
  documentVersionId: string;
  file: File;
}

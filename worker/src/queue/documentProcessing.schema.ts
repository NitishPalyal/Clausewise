import * as z from "zod";

export const documentProcessingJobDataSchema = z.object({
  uploadedFileKey: z.string().min(1),
  fileType: z.enum(["pdf", "docx"]),
  documentVersionId: z.string(),
  tenantId: z.string(),
});

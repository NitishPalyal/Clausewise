import * as z from "zod";

export const documentProcessingJobDataSchema = z.object({
  fileBuffer: z.instanceof(Buffer),
  fileType: z.enum(["pdf", "docx"]),
  documentVersionId: z.string(),
  tenantId: z.string(),
});

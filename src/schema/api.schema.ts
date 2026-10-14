import * as z from "zod";
export const documentUploadSchema = z.object({
  tenantId: z.string(),
  fileType: z.enum(["pdf", "docx"]),
  documentVersionId: z.string(),
  file: z.file(),
});

export type enqueueDocumentProcessingParam = z.infer<
  typeof documentUploadSchema
>;

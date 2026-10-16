import * as z from "zod";
export const documentUploadSchema = z.object({
  tenantId: z.string().min(1),
  documentVersionId: z.string().min(1),
  file: z.file().max(10 * 1024 * 1024), // 10 MB
});

export type enqueueDocumentProcessingParam = z.infer<
  typeof documentUploadSchema
>;

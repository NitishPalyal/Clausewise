import * as z from "zod";
export const documentUploadSchema = z.object({
  tenantId: z.string().min(1),
  documentId: z.string().min(1).optional(),
  documentVersionId: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  type: z
    .enum(["VENDOR_CERTIFICATE", "AUDIT_REPORT", "COMPLIANCE_CHECKLIST"])
    .optional(),
  file: z.file().max(10 * 1024 * 1024), // 10 MB
}).refine(
  ({ documentId, documentVersionId }) =>
    !(documentId && documentVersionId),
  {
    message: "Provide either documentId or documentVersionId, not both",
    path: ["documentId"],
  },
);

export type enqueueDocumentProcessingParam = z.infer<
  typeof documentUploadSchema
>;

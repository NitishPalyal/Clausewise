import * as z from "zod";
const documentTypeSchema = z.enum([
  "VENDOR_CERTIFICATE",
  "AUDIT_REPORT",
  "COMPLIANCE_CHECKLIST",
]);

const documentFileSchema = z.file().max(10 * 1024 * 1024);

export const createDocumentUploadSchema = z.object({
  tenantId: z.string().min(1),
  title: z.string().min(1),
  type: documentTypeSchema,
  file: documentFileSchema,
});

export const createDocumentVersionUploadSchema = z.object({
  tenantId: z.string().min(1),
  documentId: z.string().min(1),
  file: documentFileSchema,
});

export const documentDeleteSchema = z.object({
  documentId: z.string().min(1),
  tenantId: z.string().min(1),
});

export const documentVersionDeleteSchema = z.object({
  documentVersionId: z.string().min(1),
  tenantId: z.string().min(1),
});

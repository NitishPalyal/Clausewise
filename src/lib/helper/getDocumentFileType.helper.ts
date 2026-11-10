import type { DocumentFileType } from "@/types/document-types";

export function getDocumentFileType(fileKey: string): DocumentFileType | null {
  const normalizedKey = fileKey.toLowerCase();

  if (normalizedKey.endsWith(".pdf")) return "pdf";
  if (normalizedKey.endsWith(".docx")) return "docx";
  return null;
}

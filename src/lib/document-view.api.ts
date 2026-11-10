import type { APIResponse } from "@/shared/types";

function getVersionPath(documentId: string, versionId: string) {
  const encodedDocumentId = encodeURIComponent(documentId);
  const encodedVersionId = encodeURIComponent(versionId);

  return `/api/documents/${encodedDocumentId}/versions/${encodedVersionId}`;
}

export function getDocumentPreviewUrl(documentId: string, versionId: string) {
  return `${getVersionPath(documentId, versionId)}/preview`;
}

export function getDocumentDownloadUrl(documentId: string, versionId: string) {
  return `${getVersionPath(documentId, versionId)}/download`;
}

export async function getDocxPreviewText(
  documentId: string,
  versionId: string,
  signal?: AbortSignal,
): Promise<string> {
  const response = await fetch(getDocumentPreviewUrl(documentId, versionId), {
    cache: "no-store",
    ...(signal ? { signal } : {}),
  });

  const result: APIResponse<{ text: string }> = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "The document preview could not be loaded.",
    );
  }

  return result.data.text;
}

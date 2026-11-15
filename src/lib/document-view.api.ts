import { fetchApiResponse } from "@/lib/api-response";

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
  const result = await fetchApiResponse<{ text: string }>(
    getDocumentPreviewUrl(documentId, versionId),
    {
      cache: "no-store",
      ...(signal ? { signal } : {}),
    },
    "We couldn't load this document preview.",
  );

  return result.data.text;
}

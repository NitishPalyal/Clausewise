import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/helper/errorResponse.helper";
import {
  downloadDocumentFile,
  extractDocumentPreviewText,
  getDocumentFileAccess,
  getDocumentStorageUrl,
} from "@/lib/helper/document-file.server";
import type { APIResponse } from "@/shared/types";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string; versionId: string }> },
) {
  const { documentId, versionId } = await params;
  const access = await getDocumentFileAccess(documentId, versionId);
  if (!access.success) {
    return errorResponse(access.message, access.code, access.status);
  }

  try {
    const { fileKey, fileType } = access.data;
    if (fileType === "pdf") {
      const url = await getDocumentStorageUrl(fileKey);
      return NextResponse.redirect(url, {
        status: 307,
        headers: { "Cache-Control": "private, no-store" },
      });
    }

    const buffer = await downloadDocumentFile(fileKey);
    const response: APIResponse<{ text: string }> = {
      success: true,
      message: "Document preview ready",
      data: { text: await extractDocumentPreviewText(buffer) },
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return errorResponse(
      "The document preview could not be loaded",
      "DOCUMENT_PREVIEW_FAILED",
      502,
    );
  }
}

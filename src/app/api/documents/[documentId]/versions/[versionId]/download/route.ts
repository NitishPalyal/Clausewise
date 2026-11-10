import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/helper/errorResponse.helper";
import {
  downloadDocumentFile,
  getDocumentContentDisposition,
  getDocumentFileAccess,
  getDocumentMimeType,
} from "@/lib/helper/document-file.server";

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
    const { fileKey, fileName, fileType } = access.data;
    const buffer = await downloadDocumentFile(fileKey);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": getDocumentContentDisposition(
          "attachment",
          fileName,
        ),
        "Content-Length": String(buffer.byteLength),
        "Content-Type": getDocumentMimeType(fileType),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return errorResponse(
      "The document could not be downloaded",
      "DOCUMENT_DOWNLOAD_FAILED",
      502,
    );
  }
}

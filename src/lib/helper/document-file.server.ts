import "server-only";

import { auth } from "@clerk/nextjs/server";
import * as DocumentVersionRepo from "@/repository/documentVersion/documentVersion.repository";
import * as UserRepo from "@/repository/user/user.repository";
import { getDocumentFileType } from "@/lib/helper/getDocumentFileType.helper";
import {
  downloadFromStorageService,
  getFileUrlFromStorageService,
} from "../../../worker/src/backblaze/backblaze.service.ts";
import { extractDocxPreviewText } from "../../../worker/src/ingestionPipeline/extraction/docxPreview.service.ts";

type DocumentFileAccess = {
  fileKey: string;
  fileName: string;
  fileType: "pdf" | "docx";
};

type DocumentFileAccessResult =
  | { success: true; data: DocumentFileAccess }
  | { success: false; status: 401 | 403 | 404; message: string; code: string };

export async function getDocumentFileAccess(
  documentId: string,
  versionId: string,
): Promise<DocumentFileAccessResult> {
  const { userId, orgId } = await auth();
  if (!userId) {
    return {
      success: false,
      status: 401,
      message: "Unauthorized",
      code: "UNAUTHORIZED",
    };
  }

  if (!orgId) {
    return {
      success: false,
      status: 403,
      message: "Select a workspace to view this document",
      code: "WORKSPACE_REQUIRED",
    };
  }

  const role = await UserRepo.findRoleForTenant(userId, orgId);
  if (!role) {
    return {
      success: false,
      status: 404,
      message: "Document version not found",
      code: "DOCUMENT_VERSION_NOT_FOUND",
    };
  }

  // Resolve the version through the active workspace before exposing its storage key.
  const version = await DocumentVersionRepo.findDocumentVersionFileForTenant(
    documentId,
    versionId,
    orgId,
  );
  if (!version) {
    return {
      success: false,
      status: 404,
      message: "Document version not found",
      code: "DOCUMENT_VERSION_NOT_FOUND",
    };
  }

  const fileType = getDocumentFileType(version.fileUrl);
  const expectedPrefix = `cluasewise/${orgId}/documents/`;
  if (!fileType || !version.fileUrl.startsWith(expectedPrefix)) {
    return {
      success: false,
      status: 404,
      message: "Document version not found",
      code: "DOCUMENT_VERSION_NOT_FOUND",
    };
  }

  return {
    success: true,
    data: {
      fileKey: version.fileUrl,
      fileName: version.fileUrl.split("/").at(-1) ?? "document",
      fileType,
    },
  };
}

export function getDocumentStorageUrl(fileKey: string) {
  return getFileUrlFromStorageService(fileKey);
}

export function downloadDocumentFile(fileKey: string) {
  return downloadFromStorageService(fileKey);
}

export function extractDocumentPreviewText(buffer: Buffer) {
  return extractDocxPreviewText(buffer);
}

export function getDocumentMimeType(fileType: "pdf" | "docx") {
  return fileType === "pdf"
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

export function getDocumentContentDisposition(
  disposition: "inline" | "attachment",
  fileName: string,
) {
  const safeName = fileName.replace(/[\u0000-\u001f\u007f]/g, "_");
  const asciiName = safeName
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/["\\]/g, "_");
  const encodedName = encodeURIComponent(safeName).replace(
    /['()!*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );

  return `${disposition}; filename="${asciiName}"; filename*=UTF-8''${encodedName}`;
}

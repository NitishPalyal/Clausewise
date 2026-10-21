import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { deleteFromStorageService } from "../../../../../worker/src/backblaze/backblaze.service.ts";
import { errorResponse } from "@/lib/helper/errorResponse.helper.ts";
import { documentDeleteSchema } from "@/schema/documentApi.schema.ts";
import type { APIResponse } from "@/shared/types.ts";
import * as DocumentRepo from "@/repository/document/document.repository.ts";
import * as UserRepo from "@/repository/user/user.repository.ts";

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  const formData = await request.formData();
  const result = documentDeleteSchema.safeParse({
    tenantId: formData.get("tenantId"),
    documentId: formData.get("documentId"),
  });

  if (!result.success) {
    return errorResponse("Invalid request data", "INVALID_REQUEST_DATA", 400);
  }

  const { tenantId, documentId } = result.data;
  const role = await UserRepo.findRoleForTenant(userId, tenantId);
  if (!role) {
    return errorResponse(
      "Tenant not found or access denied",
      "TENANT_NOT_FOUND",
      404,
    );
  }
  if (role !== "MANAGER") {
    return errorResponse("Manager role required", "FORBIDDEN", 403);
  }

  const deletedFileKeys = await DocumentRepo.deleteDocumentForTenant(
    documentId,
    tenantId,
  );
  if (!deletedFileKeys) {
    return errorResponse("Document not found", "DOCUMENT_NOT_FOUND", 404);
  }

  const cleanupResults = await Promise.allSettled(
    deletedFileKeys.map((fileKey) => deleteFromStorageService(fileKey)),
  );
  const cleanupFailures = cleanupResults.filter(
    (result) => result.status === "rejected",
  );
  if (cleanupFailures.length > 0) {
    cleanupFailures.forEach((failure) => {
      if (failure.status === "rejected") {
        console.error(
          "Failed to delete document storage object",
          failure.reason,
        );
      }
    });
    return errorResponse(
      "Document deleted, but one or more stored files could not be removed",
      "STORAGE_CLEANUP_FAILED",
      500,
    );
  }

  const response: APIResponse<{ documentId: string }> = {
    success: true,
    message: "Document deleted",
    data: { documentId },
  };

  return NextResponse.json(response, { status: 200 });
}

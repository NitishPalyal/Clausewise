import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { deleteFromStorageService } from "../../../../../worker/src/backblaze/backblaze.service.ts";
import { errorResponse } from "@/lib/helper/errorResponse.helper.ts";
import { documentVersionDeleteSchema } from "@/schema/api.schema";
import type { APIResponse } from "@/shared/types.ts";
import * as DocumentVersionRepo from "@/repository/documentVersion/documentVersion.repository.ts";
import * as UserRepo from "@/repository/user/user.repository.ts";

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  const formData = await request.formData();
  const result = documentVersionDeleteSchema.safeParse({
    tenantId: formData.get("tenantId"),
    documentVersionId: formData.get("documentVersionId"),
  });

  if (!result.success) {
    return errorResponse("Invalid request data", "INVALID_REQUEST_DATA", 400);
  }

  const { tenantId, documentVersionId } = result.data;
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

  const deletedVersion = await DocumentVersionRepo.deleteVersionForTenant(
    documentVersionId,
    tenantId,
  );
  if (!deletedVersion) {
    return errorResponse(
      "Document version not found",
      "DOCUMENT_VERSION_NOT_FOUND",
      404,
    );
  }

  try {
    await deleteFromStorageService(deletedVersion.fileUrl);
  } catch (error) {
    console.error("Failed to delete document version storage object", error);
    return errorResponse(
      "Document version deleted, but its stored file could not be removed",
      "STORAGE_CLEANUP_FAILED",
      500,
    );
  }

  const response: APIResponse<{ documentVersionId: string }> = {
    success: true,
    message: "Document version deleted",
    data: { documentVersionId },
  };

  return NextResponse.json(response, { status: 200 });
}

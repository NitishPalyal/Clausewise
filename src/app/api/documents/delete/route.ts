import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { deleteFromStorageService } from "../../../../../worker/src/backblaze/backblaze.service.ts";
import { errorResponse } from "@/lib/helper/errorResponse.helper.ts";
import * as DocumentRepo from "@/repository/document/document.repository.ts";
import * as UserRepo from "@/repository/user/user.repository.ts";
import { documentDeleteSchema } from "@/schema/documentApi.schema.ts";
import type { APIResponse } from "@/shared/types.ts";

/** Deletes the tenant's document records, then best-effort removes stored files. */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }

    const body: unknown = await request.json().catch(() => null);
    const result = documentDeleteSchema.safeParse(body);
    if (!result.success) {
      return errorResponse("Invalid request data", "INVALID_REQUEST_DATA", 400);
    }

    const { documentId, tenantId } = result.data;
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

    const fileKeys = await DocumentRepo.deleteDocumentForTenant(
      documentId,
      tenantId,
    );
    if (!fileKeys) {
      return errorResponse("Document not found", "DOCUMENT_NOT_FOUND", 404);
    }

    const cleanupResults = await Promise.allSettled(
      fileKeys.map((fileKey) => deleteFromStorageService(fileKey)),
    );
    const cleanupFailures = cleanupResults.filter(
      (result) => result.status === "rejected",
    );

    for (const failure of cleanupFailures) {
      if (failure.status === "rejected") {
        console.error("Failed to remove a deleted document's stored file", {
          documentId,
          error: failure.reason,
        });
      }
    }

    const response: APIResponse<{ documentId: string }> = {
      success: true,
      message: "Document deleted",
      data: { documentId },
      ...(cleanupFailures.length > 0 && {
        warning:
          "The document was deleted, but one or more stored files could not be removed.",
      }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Document deletion API failed", error);

    const response: APIResponse = {
      success: false,
      message: "The document deletion request failed on the server",
      data: null,
      error: {
        code: "DOCUMENT_DELETE_FAILED",
        ...(process.env.NODE_ENV === "development" &&
          error instanceof Error && { details: error.message }),
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}

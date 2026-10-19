import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { enqueueDocumentProcessing } from "@/lib/queue";
import { getFileType } from "@/lib/helper/getFileType.helper.ts";
import { createDocumentUploadSchema } from "@/schema/api.schema";
import type { APIResponse, FileType } from "@/shared/types.ts";
import * as DocumentVersionRepo from "@/repository/documentVersion/documentVersion.repository.ts";
import * as TenantRepo from "@/repository/tetant/tetant.repository.ts";
import {
  deleteFromStorageService,
  uploadToStorageService,
} from "../../../../../worker/src/backblaze/backblaze.service.ts";
import { FolderName } from "../../../../../worker/src/backblaze/backblaze.types.ts";
import { errorResponse } from "@/lib/helper/errorResponse.helper.ts";

async function cleanUpUploadedFile(uploadedFileKey: string) {
  try {
    await deleteFromStorageService(uploadedFileKey);
  } catch (error) {
    console.error("Failed to clean up uploaded document", error);
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  const formData = await request.formData();
  const result = createDocumentUploadSchema.safeParse({
    tenantId: formData.get("tenantId"),
    title: formData.get("title"),
    type: formData.get("type"),
    file: formData.get("file"),
  });

  if (!result.success) {
    return errorResponse("Invalid request data", "INVALID_REQUEST_DATA", 400);
  }

  const { tenantId, title, type, file } = result.data;

  const tenant = await TenantRepo.findOne(tenantId, userId);
  if (!tenant) {
    return errorResponse(
      "Tenant not found or access denied",
      "TENANT_NOT_FOUND",
      404,
    );
  }

  let fileType: FileType;
  try {
    fileType = getFileType(file);
  } catch {
    return errorResponse("Unsupported file type", "UNSUPPORTED_FILE_TYPE", 400);
  }

  const uploadedFileKey = await uploadToStorageService({
    buffer: Buffer.from(await file.arrayBuffer()),
    fileType,
    folderName: FolderName.documents,
    originalname: file.name,
    tenantId,
  });

  let createdVersion: { documentId: string; documentVersionId: string };
  try {
    createdVersion = await DocumentVersionRepo.createWithFirstVersion({
      tenantId,
      title,
      type,
      fileUrl: uploadedFileKey,
    });
  } catch (error) {
    await cleanUpUploadedFile(uploadedFileKey);
    throw error;
  }

  await enqueueDocumentProcessing({
    uploadedFileKey,
    fileType,
    documentVersionId: createdVersion.documentVersionId,
    tenantId,
  });

  const response: APIResponse<{
    documentId: string;
    documentVersionId: string;
  }> = {
    success: true,
    message: "Document enqueued for processing",
    data: {
      documentId: createdVersion.documentId,
      documentVersionId: createdVersion.documentVersionId,
    },
  };

  return NextResponse.json(response, { status: 200 });
}

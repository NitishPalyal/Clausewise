import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { enqueueDocumentProcessing } from "@/lib/queue";
import { documentUploadSchema } from "@/schema/api.schema";
import type { APIResponse, FileType } from "@/shared/types.ts";
import { uploadToStorageService } from "../../../../../worker/src/backblaze/backblaze.service.ts";
import { getFileType } from "@/lib/helper/getFileType.helper.ts";
import { FolderName } from "../../../../../worker/src/backblaze/backblaze.types.ts";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();

  const result = documentUploadSchema.safeParse({
    tenantId: formData.get("tenantId"),
    documentVersionId: formData.get("documentVersionId"),
    file: formData.get("file"),
  });

  if (!result.success) {
    const response: APIResponse = {
      success: false,
      message: "Invalid request data",
      data: null,
      error: {
        code: "INVALID_REQUEST_DATA",
      },
    };
    return NextResponse.json(response, { status: 400 });
  }

  const { tenantId, documentVersionId, file } = result.data;

  let fileType: FileType;
  try {
    fileType = getFileType(file);
  } catch {
    const response: APIResponse = {
      success: false,
      message: "Unsupported file type",
      data: null,
      error: {
        code: "UNSUPPORTED_FILE_TYPE",
      },
    };
    return NextResponse.json(response, { status: 400 });
  }

  const uploadedFileKey = await uploadToStorageService({
    buffer: Buffer.from(await file.arrayBuffer()),
    fileType,
    folderName: FolderName.documents,
    originalname: file.name,
    tenantId,
  });

  await enqueueDocumentProcessing({
    uploadedFileKey,
    fileType,
    documentVersionId,
    tenantId,
  });

  const response: APIResponse = {
    success: true,
    message: "Document enqueued for processing",
    data: null,
  };

  return NextResponse.json(response, { status: 200 });
}

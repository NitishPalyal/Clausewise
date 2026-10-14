import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { enqueueDocumentProcessing } from "@/lib/queue";
import { documentUploadSchema } from "@/schema/api.schema";
import { APIResponse } from "@/shared/types.ts";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await req.json();
  const requestBody = documentUploadSchema.safeParse(body);

  if (!requestBody.success) {
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
  await enqueueDocumentProcessing(requestBody.data);

  const response: APIResponse = {
    success: true,
    message: "Document enqueued for processing",
    data: null,
  };

  return NextResponse.json(response, { status: 200 });
}

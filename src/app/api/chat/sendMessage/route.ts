import { errorResponse } from "@/lib/helper/errorResponse.helper";
import { sendMessageSchema } from "@/schema/chatApi.schema";
import { generateChatName } from "@/service/chat.service";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import * as ChatRepo from "@/repository/chat/chat.repository";
import * as MessageRepo from "@/repository/message/messages.repostory.ts";
import { retrievalPipeline } from "@/retrievalPipeline/retrievalPipeline";
import { APIResponse } from "@/shared/types";
import type { Citation } from "@/retrievalPipeline/citations/citations.types";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }
  const formData = await request.formData();
  const result = sendMessageSchema.safeParse({
    message: formData.get("message"),
    existingChatId: formData.get("existingChatId"),
    tenantId: formData.get("tenantId"),
  });
  if (!result.success) {
    return errorResponse("Invalid request data", "INVALID_REQUEST_DATA", 400);
  }

  const { message, existingChatId, tenantId } = result.data;

  let chatId: string;
  if (existingChatId) {
    chatId = existingChatId;
  } else {
    const title: string = await generateChatName(message);
    chatId = await ChatRepo.createChat(userId, title);
  }

  await MessageRepo.createMessage(chatId, "user", message);
  const { response: aiResponse, citations } = await retrievalPipeline(
    message,
    tenantId,
    chatId,
  );
  await MessageRepo.createMessage(chatId, "ai", aiResponse.answer);
  const response: APIResponse<{
    chatId: string;
    response: string;
    citations: Citation[];
  }> = {
    success: true,
    message: "Message sent successfully",
    data: {
      chatId,
      response: aiResponse.answer,
      citations,
    },
  };

  return NextResponse.json(response, { status: 200 });
}

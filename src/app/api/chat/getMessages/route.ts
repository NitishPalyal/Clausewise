import { errorResponse } from "@/lib/helper/errorResponse.helper";
import { getMessageSchema } from "@/schema/chatApi.schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import * as ChatRepo from "@/repository/chat/chat.repository.ts";
import * as MessageRepo from "@/repository/message/messages.repostory.ts";
import { APIResponse } from "@/shared/types";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  const result = getMessageSchema.safeParse({
    chatId: request.nextUrl.searchParams.get("chatId"),
  });
  if (!result.success) {
    return errorResponse("Invalid request data", "INVALID_REQUEST_DATA", 400);
  }
  const { chatId } = result.data;
  const chat = await ChatRepo.findChat(chatId, userId);

  if (!chat) {
    return errorResponse("chat not found", "CHAT_NOT_FOUND", 404);
  }

  const messages = await MessageRepo.findMessages(chat.id);
  const response: APIResponse<{
    messages: Awaited<ReturnType<typeof MessageRepo.findMessages>>;
  }> = {
    success: true,
    message: "Messages retrieved successfully",
    data: {
      messages,
    },
  };
  return NextResponse.json(response, { status: 200 });
}

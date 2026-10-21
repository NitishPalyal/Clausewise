import { errorResponse } from "@/lib/helper/errorResponse.helper";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import * as ChatRepo from "@/repository/chat/chat.repository";
import { APIResponse } from "@/shared/types";
import { deleteChatSchema } from "@/schema/chatApi.schema";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  const result = deleteChatSchema.safeParse({
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

  await ChatRepo.deleteChat(chat.id, userId);

  const response: APIResponse = {
    success: true,
    message: "chat deleted successfully",
    data: null,
  };

  return NextResponse.json(response, { status: 200 });
}

import { errorResponse } from "@/lib/helper/errorResponse.helper";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import * as ChatRepo from "@/repository/chat/chat.repository";
import { APIResponse } from "@/shared/types";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  const chats = await ChatRepo.findChats(userId);
  const response: APIResponse<{
    chats: Awaited<ReturnType<typeof ChatRepo.findChats>>;
  }> = {
    success: true,
    message: "all chats retrieved successfully",
    data: {
      chats,
    },
  };

  return NextResponse.json(response, { status: 200 });
}

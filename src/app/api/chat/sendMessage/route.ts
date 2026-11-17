import { errorResponse } from "@/lib/helper/errorResponse.helper";
import { sendMessageSchema } from "@/schema/chatApi.schema";
import { generateChatName } from "@/service/chat.service";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import * as ChatRepo from "@/repository/chat/chat.repository";
import * as MessageRepo from "@/repository/message/messages.repostory.ts";
import { retrievalPipeline } from "@/retrievalPipeline/retrievalPipeline";
import { APIResponse } from "@/shared/types";
import type { Citation } from "@/retrievalPipeline/citations/citations.types";
import { publishChatReplyReady } from "@/lib/redis/chatNotification";
import { prisma } from "@/lib/prisma";
import { isAiServiceUnavailable } from "@/lib/ai-errors";

/** Saves the user's message, runs retrieval, and returns an answer with citations. */
export async function POST(request: NextRequest) {
  try {
    const { userId, orgId, orgRole } = await auth();
    if (!userId) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }
    const formData = await request.formData();
    const result = sendMessageSchema.safeParse({
      message: formData.get("message"),
      existingChatId: formData.get("existingChatId") ?? undefined,
      tenantId: formData.get("tenantId"),
    });
    if (!result.success) {
      return errorResponse("Invalid request data", "INVALID_REQUEST_DATA", 400);
    }

    const { message, existingChatId, tenantId } = result.data;

    if (!orgId || orgId !== tenantId) {
      return errorResponse(
        "Select the organization you want to use for this chat.",
        "FORBIDDEN",
        403,
      );
    }

    const localUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { tenantId: true },
    });

    if (!localUser) {
      const localTenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true },
      });

      if (!localTenant) {
        return errorResponse(
          "The selected organization is not available yet. Try again shortly.",
          "TENANT_NOT_FOUND",
          404,
        );
      }

      const clerkUser = await currentUser();
      const email =
        clerkUser?.primaryEmailAddress?.emailAddress ??
        clerkUser?.emailAddresses[0]?.emailAddress;

      if (!email) {
        return errorResponse(
          "Your account needs an email address before you can start a chat.",
          "USER_EMAIL_REQUIRED",
          409,
        );
      }

      const syncedUser = await prisma.user.upsert({
        where: { clerkUserId: userId },
        update: {},
        create: {
          clerkUserId: userId,
          email,
          tenantId,
          role: orgRole === "org:admin" ? "MANAGER" : "MEMBER",
        },
        select: { tenantId: true },
      });

      if (syncedUser.tenantId !== tenantId) {
        return errorResponse(
          "You don't have access to the selected organization.",
          "FORBIDDEN",
          403,
        );
      }
    } else if (localUser.tenantId !== tenantId) {
      return errorResponse(
        "You don't have access to the selected organization.",
        "FORBIDDEN",
        403,
      );
    }

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
    await MessageRepo.createMessage(
      chatId,
      "ai",
      aiResponse.answer,
      citations,
    );
    // Notify the user's connected devices that an AI reply is ready.
    try {
      await publishChatReplyReady({
        userId,
        chatId,
      });
    } catch (error) {
      // The AI response is already saved, so notification failure
      // should not make the chat API request fail.
      console.error("Failed to publish chat reply notification:", error);
    }
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
  } catch (error) {
    if (isAiServiceUnavailable(error)) {
      console.error("Chat AI service is temporarily unavailable", error);
      return errorResponse(
        "Our AI service is busy right now. Please try again in a moment.",
        "AI_SERVICE_UNAVAILABLE",
        503,
      );
    }

    console.error("Chat message API failed", error);
    return errorResponse(
      "We couldn't send your message right now. Please try again shortly.",
      "CHAT_SEND_FAILED",
      500,
    );
  }
}

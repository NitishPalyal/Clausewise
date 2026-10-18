// src/retrievalPipeline/history/history.ts
import { prisma } from "@/lib/prisma";
import { ChatTurn } from "@/retrievalPipeline/generation/generation.types";

const HISTORY_WINDOW = 10;

export async function fetchHistory(chatId: string): Promise<ChatTurn[]> {
  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { timestamp: "desc" },
    take: HISTORY_WINDOW,
    select: { role: true, content: true },
  });
  return messages.reverse(); // DESC gives newest-first; flip to chronological for the AI
}

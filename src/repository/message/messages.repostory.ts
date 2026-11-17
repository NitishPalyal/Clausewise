import { prisma } from "@/lib/prisma";
import type { Citation } from "@/retrievalPipeline/citations/citations.types";
import type { ChatTurn } from "@/retrievalPipeline/generation/generation.types";

const HISTORY_WINDOW = 10;

/** Returns the latest messages in chronological order for the chat model. */
export async function fetchHistory(chatId: string): Promise<ChatTurn[]> {
  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { timestamp: "desc" },
    take: HISTORY_WINDOW,
    select: { role: true, content: true },
  });
  return messages.reverse();
}

export async function createMessage(
  chatId: string,
  role: ChatTurn["role"],
  message: string,
  citations?: Citation[],
) {
  const citationData = citations?.map((citation) => ({
    marker: citation.marker,
    sectionPath: citation.sectionPath,
    pageStart: citation.pageStart,
    pageEnd: citation.pageEnd,
    documentTitle: citation.documentTitle,
    versionNumber: citation.versionNumber,
  }));

  await prisma.message.create({
    data: {
      chatId,
      role,
      content: message,
      ...(citationData ? { citations: citationData } : {}),
    },
  });
}

export async function findMessages(chatId: string) {
  return await prisma.message.findMany({
    where: { chatId },
  });
}

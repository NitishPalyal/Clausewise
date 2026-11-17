import { prisma } from "@/lib/prisma";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function createChat(clerkUserId: string, title: string) {
  let suffix = 1;

  while (true) {
    const chatTitle = suffix === 1 ? title : `${title} (${suffix})`;
    try {
      const newChat = await prisma.chat.create({
        data: {
          title: chatTitle,
          user: {
            connect: { clerkUserId },
          },
        },
      });
      return newChat.id;
    } catch (error) {
      if (!isUniqueConstraintError(error) || suffix === 5) throw error;
      suffix += 1;
    }
  }
}

export async function findChat(id: string, clerkUserId: string) {
  return await prisma.chat.findFirst({
    where: {
      id,
      user: { clerkUserId },
    },
  });
}
export async function findChats(clerkUserId: string) {
  return await prisma.chat.findMany({
    where: {
      user: { clerkUserId },
    },
  });
}
export async function deleteChat(id: string, clerkUserId: string) {
  return await prisma.chat.deleteMany({
    where: {
      id,
      user: { clerkUserId },
    },
  });
}

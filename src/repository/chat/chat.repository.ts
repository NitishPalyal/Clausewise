import { prisma } from "@/lib/prisma";

export async function createChat(clerkUserId: string, title: string) {
  const newChat = await prisma.chat.create({
    data: {
      title,
      user: {
        connect: { clerkUserId },
      },
    },
  });
  return newChat.id;
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

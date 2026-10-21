import { prisma } from "@/lib/prisma";

export async function createChat(userId: string, title: string) {
  const newChat = await prisma.chat.create({
    data: {
      title,
      userId,
    },
  });
  return newChat.id;
}

export async function findChat(id: string, userId: string) {
  return await prisma.chat.findUnique({
    where: {
      id,
      userId,
    },
  });
}
export async function findChats(userId: string) {
  return await prisma.chat.findMany({
    where: {
      userId,
    },
  });
}
export async function deleteChat(id: string, userId: string) {
  return await prisma.chat.delete({
    where: {
      userId,
      id,
    },
  });
}

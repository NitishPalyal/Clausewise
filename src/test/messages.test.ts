import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { fetchHistory } from "@/repository/message/messages.repostory.ts";

afterAll(async () => {
  await prisma.$executeRaw`DELETE FROM "Message" WHERE "chatId" LIKE 't\\_%'`;
  await prisma.$executeRaw`DELETE FROM "Chat" WHERE id LIKE 't\\_%'`;
  await prisma.$disconnect();
});

describe("fetchHistory", () => {
  it("returns only the last 10 messages, oldest to newest, for a chat with more than 10", async () => {
    const history = await fetchHistory("t_chat_long");
    expect(history).toHaveLength(10);
    expect(history[0]!.content).toBe("reply 1"); // the 11th-from-newest message — correct cutoff
    expect(history[9]!.content).toBe("reply 6"); // most recent, correctly last, not first
  });

  it("returns all messages, not padded or errored, for a chat with fewer than 10", async () => {
    const history = await fetchHistory("t_chat_short");
    expect(history).toEqual([
      { role: "user", content: "What torque for M8 bolts?" },
      { role: "ai", content: "Torque M8 bolts to 24 Nm." },
    ]);
  });

  it("returns an empty array for a chat with no messages yet", async () => {
    expect(await fetchHistory("t_chat_brand_new")).toEqual([]);
  });
});

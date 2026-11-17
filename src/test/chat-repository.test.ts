import { afterEach, describe, expect, it, vi } from "vitest";

const { createChatMock } = vi.hoisted(() => ({
  createChatMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    chat: {
      create: createChatMock,
    },
  },
}));

import { createChat } from "@/repository/chat/chat.repository";

describe("createChat", () => {
  afterEach(() => {
    createChatMock.mockReset();
  });

  it("adds a suffix when a user already has a chat with that title", async () => {
    createChatMock
      .mockRejectedValueOnce({ code: "P2002" })
      .mockResolvedValueOnce({ id: "chat-2" });

    await expect(createChat("clerk-user", "Driver Duties")).resolves.toBe(
      "chat-2",
    );
    expect(createChatMock).toHaveBeenNthCalledWith(1, {
      data: {
        title: "Driver Duties",
        user: { connect: { clerkUserId: "clerk-user" } },
      },
    });
    expect(createChatMock).toHaveBeenNthCalledWith(2, {
      data: {
        title: "Driver Duties (2)",
        user: { connect: { clerkUserId: "clerk-user" } },
      },
    });
  });

  it("propagates errors other than title uniqueness conflicts", async () => {
    const error = new Error("Database unavailable");
    createChatMock.mockRejectedValue(error);

    await expect(createChat("clerk-user", "Driver Duties")).rejects.toBe(
      error,
    );
  });
});

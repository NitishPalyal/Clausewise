import { afterEach, describe, expect, it, vi } from "vitest";

const { createMessageMock } = vi.hoisted(() => ({
  createMessageMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    message: {
      create: createMessageMock,
    },
  },
}));

import { createMessage } from "@/repository/message/messages.repostory";

describe("createMessage", () => {
  afterEach(() => {
    createMessageMock.mockReset();
  });

  it("persists citation details with the assistant answer", async () => {
    const citations = [
      {
        marker: 1,
        sectionPath: "4 Procedure",
        pageStart: 2,
        pageEnd: 3,
        documentTitle: "MOTOR_SOP",
        versionNumber: 1,
      },
    ];

    await createMessage("chat-1", "ai", "Answer", citations);

    expect(createMessageMock).toHaveBeenCalledWith({
      data: {
        chatId: "chat-1",
        role: "ai",
        content: "Answer",
        citations,
      },
    });
  });

  it("does not add citation metadata to messages without citations", async () => {
    await createMessage("chat-1", "user", "Question");

    expect(createMessageMock).toHaveBeenCalledWith({
      data: {
        chatId: "chat-1",
        role: "user",
        content: "Question",
      },
    });
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

const { generateContentMock } = vi.hoisted(() => ({
  generateContentMock: vi.fn(),
}));

vi.mock("@/lib/ai.config.ts", () => ({
  gemini: { models: { generateContent: generateContentMock } },
}));

import { generateChatName } from "@/service/chat.service";

describe("generateChatName", () => {
  afterEach(() => {
    generateContentMock.mockReset();
    vi.restoreAllMocks();
  });

  it("uses the generated title when the model responds", async () => {
    generateContentMock.mockResolvedValue({ text: "Driver Responsibilities" });

    await expect(generateChatName("What does a driver do?")).resolves.toBe(
      "Driver Responsibilities",
    );
  });

  it("falls back to the question when the model is temporarily unavailable", async () => {
    const error = Object.assign(new Error("Service unavailable"), {
      status: 503,
    });
    generateContentMock.mockRejectedValue(error);
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      generateChatName("What are the driver responsibilities in this SOP?"),
    ).resolves.toBe("What are the driver responsibilities in");
  });

  it("still propagates non-transient model errors", async () => {
    const error = Object.assign(new Error("Bad request"), { status: 400 });
    generateContentMock.mockRejectedValue(error);

    await expect(generateChatName("Question")).rejects.toBe(error);
  });
});

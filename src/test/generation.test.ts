import { describe, it, expect } from "vitest";
import { toGeminiContents } from "@/retrievalPipeline/generation/generation.ts";
import type { ChatTurn } from "@/retrievalPipeline/generation/generation.types.ts";

describe("toGeminiContents", () => {
  it("produces just the new prompt, as a user turn, when there is no history", () => {
    const result = toGeminiContents([], "Question: What torque for M8 bolts?");
    expect(result).toEqual([
      {
        role: "user",
        parts: [{ text: "Question: What torque for M8 bolts?" }],
      },
    ]);
  });

  it("translates the stored 'ai' role to Gemini's 'model' role, and keeps order intact", () => {
    const history: ChatTurn[] = [
      { role: "user", content: "What torque should I use for M8 bolts?" },
      {
        role: "ai",
        content: "Torque M8 bolts to 24 Nm using a calibrated wrench [1].",
      },
    ];
    const result = toGeminiContents(history, "Question: What about M10?");
    expect(result.map((c) => c.role)).toEqual(["user", "model", "user"]);
    expect(result[1]).toEqual({
      role: "model",
      parts: [
        { text: "Torque M8 bolts to 24 Nm using a calibrated wrench [1]." },
      ],
    });
  });
});

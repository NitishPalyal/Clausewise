// src/retrievalPipeline/generation/generateChatName.ts
import { gemini } from "@/lib/ai.config.ts";
import { GENERATION_MODEL } from "@/shared/variable.ts";

export async function generateChatName(firstMessage: string): Promise<string> {
  const result = await gemini.models.generateContent({
    model: GENERATION_MODEL,
    contents: `Generate a short 3-6 word title for a conversation that starts with this message. Respond with only the title — no quotes, no trailing punctuation.\n\nMessage: ${firstMessage}`,
  });
  return (result.text ?? "New Chat").trim();
}

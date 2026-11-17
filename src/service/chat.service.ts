import { gemini } from "@/lib/ai.config.ts";
import { isAiServiceUnavailable } from "@/lib/ai-errors";
import { GENERATION_MODEL } from "@/shared/variable.ts";

function fallbackChatName(message: string): string {
  const words = message.trim().replace(/\s+/g, " ").split(" ").slice(0, 6);
  return words.join(" ") || "New Chat";
}

export async function generateChatName(firstMessage: string): Promise<string> {
  try {
    const result = await gemini.models.generateContent({
      model: GENERATION_MODEL,
      contents: `Generate a short 3-6 word title for a conversation that starts with this message. Respond with only the title — no quotes, no trailing punctuation.\n\nMessage: ${firstMessage}`,
    });
    const title = result.text?.trim();
    if (title) return title;

    console.warn(
      "Chat title generation returned no title; using the question text.",
    );
    return fallbackChatName(firstMessage);
  } catch (error) {
    if (!isAiServiceUnavailable(error)) throw error;

    console.warn(
      "Chat title generation is temporarily unavailable; using the question text.",
      error,
    );
    return fallbackChatName(firstMessage);
  }
}

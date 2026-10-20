// src/retrievalPipeline/rewrite/rewrite.ts
import { gemini } from "@/lib/ai.config.ts";
import { RERANK_MODEL } from "@/shared/variable.ts"; // reusing the existing fast model — no need for a third one
import { rewriteResponseSchema } from "@/retrievalPipeline/rewrite/rewrite.types.ts";
import type { ChatTurn } from "../generation/generation.types.ts";

function buildPrompt(history: ChatTurn[], latestMessage: string): string {
  const transcript = history.map((t) => `${t.role}: ${t.content}`).join("\n");
  return (
    `Conversation so far:\n${transcript}\n\n` +
    `New message: ${latestMessage}\n\n` +
    `Rewrite the new message as a standalone question that makes full sense without the ` +
    `conversation above — for example, replace "it" or "what about X" with the actual topic. ` +
    `If it's already standalone, return it unchanged.`
  );
}

async function callGemini(prompt: string): Promise<string> {
  const result = await gemini.models.generateContent({
    model: RERANK_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: rewriteResponseSchema,
    },
  });
  const parsed = JSON.parse(result.text ?? "{}");
  return parsed.standaloneQuestion ?? "";
}

export async function rewriteStandalone(
  history: ChatTurn[],
  latestMessage: string,
  rewriteFn: (prompt: string) => Promise<string> = callGemini,
): Promise<string> {
  if (history.length === 0) return latestMessage; // nothing to resolve against — skip the call

  try {
    const rewritten = await rewriteFn(buildPrompt(history, latestMessage));
    return rewritten.trim() || latestMessage; // empty/blank result also falls back
  } catch {
    return latestMessage; // a rewrite failure should never block search
  }
}

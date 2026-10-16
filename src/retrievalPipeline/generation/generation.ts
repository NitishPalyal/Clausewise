// src/retrievalPipeline/generation/generation.ts
import type { Content } from "@google/genai";
import { gemini } from "@/lib/ai.config.ts";
import { GENERATION_MODEL } from "@/shared/variable.ts";
import { generationResponseSchema } from "./generation.schema.ts";
import type { RankedChunk } from "../rerank/rerank.types.ts";
import type { ChatTurn, GenerationResult } from "./generation.types.ts";

const SYSTEM_INSTRUCTION =
  "You are a compliance assistant answering questions about a company's manufacturing SOPs, " +
  "using only the passages provided for this turn. Conversation history is given for context " +
  "(to understand follow-ups and earlier topics), but your answer and citations must be grounded " +
  "only in the current passages, never in facts recalled from earlier turns alone. If the current " +
  "passages don't contain the answer, say so plainly instead of guessing. After any sentence that " +
  'uses a specific passage, insert a bracketed number like [1]. In "citations", map each bracket ' +
  "number to the index of the passage it came from, using only indices from the current passage list.";

function buildPassagesPrompt(question: string, chunks: RankedChunk[]): string {
  const passages = chunks.map((c, i) => `[${i}] ${c.text}`).join("\n\n");
  return `Question: ${question}\n\nPassages:\n${passages}`;
}

export function toGeminiContents(
  history: ChatTurn[],
  latestPrompt: string,
): Content[] {
  const historyContents: Content[] = history.map((turn) => ({
    role: turn.role === "ai" ? "model" : "user",
    parts: [{ text: turn.content }],
  }));
  return [
    ...historyContents,
    { role: "user", parts: [{ text: latestPrompt }] },
  ];
}

export async function generateResponse(
  question: string,
  chunks: RankedChunk[],
  history: ChatTurn[] = [],
): Promise<GenerationResult> {
  const prompt = buildPassagesPrompt(question, chunks);
  const contents = toGeminiContents(history, prompt);

  const result = await gemini.models.generateContent({
    model: GENERATION_MODEL,
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: generationResponseSchema,
    },
  });

  const parsed = JSON.parse(result.text ?? '{"answer":"","citations":[]}');
  return { answer: parsed.answer ?? "", rawCitations: parsed.citations ?? [] };
}

// worker/src/rag/retrievalPipeline/rerank/rerank.service.ts

import type { RetrievedChunk } from "../vectorSearch/vectorSearch.types.ts";
import type { RankedChunk } from "./rerank.types.ts";
import { gemini } from "@/lib/ai.config.ts";
import { RERANK_MODEL, TOP_N } from "@/shared/variable.ts";
import { responseSchema } from "./rerank.schema.ts";

function buildPrompt(query: string, candidates: RetrievedChunk[]): string {
  const passages = candidates.map((c, i) => `[${i}] ${c.text}`).join("\n\n");
  return (
    `Question: ${query}\n\n` +
    `Candidate passages:\n${passages}\n\n` +
    `Return the indices of the ${TOP_N} passages that best answer the question, ` +
    `ordered from most to least relevant. Respond with only a JSON array of integers.`
  );
}

async function callGeminiRerank(
  query: string,
  candidates: RetrievedChunk[],
): Promise<number[]> {
  const result = await gemini.models.generateContent({
    model: RERANK_MODEL,
    contents: buildPrompt(query, candidates),
    config: { responseMimeType: "application/json", responseSchema },
  });
  return JSON.parse(result.text ?? "[]");
}

function fallbackOrder(candidates: RetrievedChunk[]): number[] {
  return candidates.slice(0, TOP_N).map((_, i) => i);
}

export async function rerankVectors(
  query: string,
  candidates: RetrievedChunk[],
  rerankFn: (
    query: string,
    candidates: RetrievedChunk[],
  ) => Promise<number[]> = callGeminiRerank,
): Promise<RankedChunk[]> {
  if (candidates.length === 0) return [];

  let indices: number[];
  try {
    indices = await rerankFn(query, candidates);
  } catch {
    indices = fallbackOrder(candidates);
  }

  const seen = new Set<number>();
  const valid = indices.filter(
    (i) =>
      Number.isInteger(i) &&
      i >= 0 &&
      i < candidates.length &&
      !seen.has(i) &&
      seen.add(i),
  );
  const safeIndices = valid.length > 0 ? valid : fallbackOrder(candidates);

  return safeIndices.slice(0, TOP_N).map((originalIndex, position) => ({
    ...candidates[originalIndex]!,
    rank: position + 1,
  }));
}

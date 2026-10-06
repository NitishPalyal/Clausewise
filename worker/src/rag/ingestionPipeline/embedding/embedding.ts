// worker/src/rag/embedding/embedding.service.ts
import ai from "../../../lib/ai.ts";
import type { Chunk } from "../chunking/chunking.types.ts";
import type { EmbeddedChunk } from "./embedding.types.ts";

const MODEL = "gemini-embedding-001";
const DIMENSIONS = 768;
const BATCH_SIZE = 20;
const MAX_RETRIES = 3;

export function normalize(vector: number[]): number[] {
  const magnitude = Math.sqrt(
    vector.reduce((sum, value) => sum + value * value, 0),
  );
  if (magnitude === 0) return vector;
  return vector.map((value) => value / magnitude);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function batchOf<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

export async function embedBatchWithRetry(
  texts: string[],
  embedFn: (texts: string[]) => Promise<number[][]> = callGemini,
): Promise<number[][]> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await embedFn(texts);
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES - 1) await sleep(1000 * 2 ** attempt);
    }
  }
  throw lastError;
}

async function callGemini(texts: string[]): Promise<number[][]> {
  const result = await ai.models.embedContent({
    model: MODEL,
    contents: texts,
    config: {
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality: DIMENSIONS,
    },
  });
  return (result.embeddings ?? []).map((e) => normalize(e.values ?? []));
}

export async function embedChunks(
  chunks: Chunk[],
  embedFn: (texts: string[]) => Promise<number[][]> = callGemini,
): Promise<EmbeddedChunk[]> {
  const embedded: EmbeddedChunk[] = [];

  for (const batch of batchOf(chunks, BATCH_SIZE)) {
    const vectors = await embedBatchWithRetry(
      batch.map((c) => c.text),
      embedFn,
    );
    batch.forEach((chunk, i) =>
      embedded.push({ ...chunk, embedding: vectors[i]! }),
    );
  }

  return embedded;
}

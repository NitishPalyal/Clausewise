import ai from "../../../worker/src/lib/ai.ts";

const MODEL = "gemini-embedding-001";
const DIMENSIONS = 768;
const MAX_RETRIES = 3;

export type EmbeddedQuery = {
  query: string;
  embedding: number[];
};

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

export async function embedBatchWithRetry(
  query: string,
  embedFn: (query: string) => Promise<number[]> = callGemini,
): Promise<number[]> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await embedFn(query);
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES - 1) await sleep(1000 * 2 ** attempt);
    }
  }
  throw lastError;
}

async function callGemini(query: string): Promise<number[]> {
  const result = await ai.models.embedContent({
    model: MODEL,
    contents: query,
    config: {
      taskType: "RETRIEVAL_QUERY",
      outputDimensionality: DIMENSIONS,
    },
  });

  const values = result.embeddings?.[0]?.values;
  if (!values) {
    throw new Error("Embedding service returned no embedding for the query");
  }
  return normalize(values);
}

export async function embedQuery(
  query: string,
  embedFn: (query: string) => Promise<number[]> = callGemini,
): Promise<EmbeddedQuery> {
  const embedding = await embedBatchWithRetry(query, embedFn);
  return { query, embedding };
}

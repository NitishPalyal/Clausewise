// worker/src/rag/retrievalPipeline/rerank/rerank.types.ts
import type { RetrievedChunk } from "../vectorSearch/vectorSearch.types.ts";

export interface RankedChunk extends RetrievedChunk {
  rank: number; // 1-based position after reranking — 1 is the most relevant
}

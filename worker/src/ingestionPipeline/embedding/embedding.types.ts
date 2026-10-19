// worker/src/rag/embedding/embedding.types.ts
import type { Chunk } from "../chunking/chunking.types.ts";

export interface EmbeddedChunk extends Chunk {
  embedding: number[]; // 768 numbers, L2-normalized
}

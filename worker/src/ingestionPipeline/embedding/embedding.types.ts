import type { Chunk } from "../chunking/chunking.types.ts";

export interface EmbeddedChunk extends Chunk {
  embedding: number[]; // 768-dimensional, L2-normalized vector.
}
